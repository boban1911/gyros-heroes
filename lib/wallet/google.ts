import { SignJWT, importPKCS8 } from 'jose';

const WALLET_API = 'https://walletobjects.googleapis.com/walletobjects/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';
const SAVE_AUDIENCE = 'google';
const SAVE_TYPE = 'savetowallet';
const SAVE_ORIGIN = 'https://www.gyrosheroes.rs';

interface ServiceAccount {
  client_email: string;
  private_key: string;
  private_key_id: string;
}

let cachedSa: ServiceAccount | null = null;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function getServiceAccount(): ServiceAccount {
  if (cachedSa) return cachedSa;
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_WALLET_SERVICE_ACCOUNT_JSON is not set');
  const decoded = raw.trim().startsWith('{')
    ? raw
    : Buffer.from(raw, 'base64').toString('utf8');
  const parsed = JSON.parse(decoded) as ServiceAccount;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('GOOGLE_WALLET_SERVICE_ACCOUNT_JSON missing client_email or private_key');
  }
  cachedSa = parsed;
  return parsed;
}

async function importPrivateKey(): Promise<CryptoKey> {
  const sa = getServiceAccount();
  return importPKCS8(sa.private_key, 'RS256');
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt - 60 > now) {
    return cachedAccessToken.token;
  }
  const sa = getServiceAccount();
  const key = await importPrivateKey();
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: sa.private_key_id })
    .setIssuer(sa.client_email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = { token: data.access_token, expiresAt: now + data.expires_in };
  return data.access_token;
}

async function walletFetch(
  method: string,
  path: string,
  body?: unknown,
  options: { tolerate404?: boolean } = {},
): Promise<unknown> {
  const token = await getAccessToken();
  const res = await fetch(`${WALLET_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404 && options.tolerate404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wallet API ${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export interface LoyaltyClassSpec {
  id: string;
  [key: string]: unknown;
}

export async function getLoyaltyClass(id: string): Promise<unknown | null> {
  return walletFetch('GET', `/loyaltyClass/${encodeURIComponent(id)}`, undefined, { tolerate404: true });
}

export async function createLoyaltyClass(spec: LoyaltyClassSpec): Promise<unknown> {
  return walletFetch('POST', '/loyaltyClass', spec);
}

export async function updateLoyaltyClass(spec: LoyaltyClassSpec): Promise<unknown> {
  return walletFetch('PUT', `/loyaltyClass/${encodeURIComponent(spec.id)}`, spec);
}

export interface LoyaltyObjectSpec {
  id: string;
  classId: string;
  [key: string]: unknown;
}

export async function getLoyaltyObject(id: string): Promise<unknown | null> {
  return walletFetch('GET', `/loyaltyObject/${encodeURIComponent(id)}`, undefined, { tolerate404: true });
}

export async function createLoyaltyObject(spec: LoyaltyObjectSpec): Promise<unknown> {
  return walletFetch('POST', '/loyaltyObject', spec);
}

export async function patchLoyaltyObject(
  id: string,
  patch: Record<string, unknown>,
): Promise<unknown> {
  return walletFetch('PATCH', `/loyaltyObject/${encodeURIComponent(id)}`, patch);
}

/**
 * Sign a Save-to-Google-Wallet JWT. The link
 * `https://pay.google.com/gp/v/save/<jwt>` opens Google Wallet and adds
 * the referenced LoyaltyObject(s) to the user's account.
 */
export async function signSaveJwt(objects: LoyaltyObjectSpec[]): Promise<string> {
  const sa = getServiceAccount();
  const key = await importPrivateKey();
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    iss: sa.client_email,
    aud: SAVE_AUDIENCE,
    typ: SAVE_TYPE,
    iat: now,
    origins: [SAVE_ORIGIN],
    payload: { loyaltyObjects: objects },
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: sa.private_key_id })
    .sign(key);
}
