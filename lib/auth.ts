import type { VercelRequest, VercelResponse } from '@vercel/node';
import { signSession, verifySession, type CustomerSessionClaims } from './jwt';

const CUSTOMER_COOKIE = 'gh_session';
const STAFF_COOKIE = 'gh_staff';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  }
  return out;
}

function buildCookie(name: string, value: string, maxAgeSeconds: number): string {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.VERCEL_ENV !== 'development') attrs.push('Secure');
  return attrs.join('; ');
}

export async function setCustomerSession(res: VercelResponse, customerId: string): Promise<void> {
  const token = await signSession({ sub: customerId, kind: 'customer' }, SESSION_TTL_SECONDS);
  res.setHeader('Set-Cookie', buildCookie(CUSTOMER_COOKIE, token, SESSION_TTL_SECONDS));
}

export function clearCustomerSession(res: VercelResponse): void {
  res.setHeader('Set-Cookie', buildCookie(CUSTOMER_COOKIE, '', 0));
}

export async function getCustomerId(req: VercelRequest): Promise<string | null> {
  const cookies = parseCookies(req);
  const token = cookies[CUSTOMER_COOKIE];
  if (!token) return null;
  try {
    const claims = await verifySession<CustomerSessionClaims>(token);
    return claims.kind === 'customer' ? claims.sub : null;
  } catch {
    return null;
  }
}

export async function requireCustomer(req: VercelRequest, res: VercelResponse): Promise<string | null> {
  const id = await getCustomerId(req);
  if (!id) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return id;
}

export { CUSTOMER_COOKIE, STAFF_COOKIE };
