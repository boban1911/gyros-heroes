import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

let cachedSecret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error('JWT_SECRET is not set');
  if (raw.length < 32) throw new Error('JWT_SECRET must be at least 32 chars');
  cachedSecret = new TextEncoder().encode(raw);
  return cachedSecret;
}

export interface CustomerSessionClaims {
  sub: string; // customer id
  kind: 'customer';
}

export interface StaffSessionClaims {
  sub: string; // staff id
  kind: 'staff';
  role: 'staff' | 'admin';
}

export type SessionClaims = CustomerSessionClaims | StaffSessionClaims;

export async function signSession(claims: SessionClaims, ttlSeconds: number): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(getSecret());
}

export async function verifySession<T extends SessionClaims>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as T;
}

/** Generates a URL-safe opaque token and its sha256 hash (hex). */
export function newOpaqueToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface QrTokenClaims {
  cardId: string;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * Sign a short-lived QR token bound to a loyalty card. `jti` is the primary
 * key in `qr_tokens` so the scan endpoint can mark it consumed and reject
 * replays.
 */
export async function signQrToken(cardId: string, ttlSeconds: number): Promise<{
  token: string;
  jti: string;
  iat: number;
  exp: number;
}> {
  const jti = randomBytes(16).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;
  const token = await new SignJWT({ cardId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(jti)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecret());
  return { token, jti, iat, exp };
}

/** Verify a QR token signature + expiry. Returns claims or throws. */
export async function verifyQrToken(token: string): Promise<QrTokenClaims> {
  const { payload } = await jwtVerify(token, getSecret());
  const cardId = typeof payload.cardId === 'string' ? payload.cardId : null;
  const jti = typeof payload.jti === 'string' ? payload.jti : null;
  const iat = typeof payload.iat === 'number' ? payload.iat : null;
  const exp = typeof payload.exp === 'number' ? payload.exp : null;
  if (!cardId || !jti || iat === null || exp === null) {
    throw new Error('qr_token_malformed');
  }
  return { cardId, jti, iat, exp };
}
