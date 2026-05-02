import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

const SECRET = (() => {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error('JWT_SECRET is not set');
  if (raw.length < 32) throw new Error('JWT_SECRET must be at least 32 chars');
  return new TextEncoder().encode(raw);
})();

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
    .sign(SECRET);
}

export async function verifySession<T extends SessionClaims>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, SECRET);
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
