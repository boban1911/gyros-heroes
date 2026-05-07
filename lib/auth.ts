import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../db/client';
import { staffSessions, staffUsers } from '../db/schema';
import {
  hashOpaqueToken,
  newOpaqueToken,
  signSession,
  verifySession,
  type CustomerSessionClaims,
} from './jwt';

const CUSTOMER_COOKIE = 'gh_session';
const STAFF_COOKIE = 'gh_staff';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const STAFF_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const STAFF_SESSION_TTL_MS = STAFF_SESSION_TTL_SECONDS * 1000;

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

export interface StaffPrincipal {
  id: string;
  role: 'staff' | 'admin';
}

/**
 * Mint a staff session: random opaque token (sent in cookie) + sha256 hash
 * (stored in `staff_sessions` as PK). Mirrors the magic-link token pattern.
 */
export async function setStaffSession(res: VercelResponse, staffId: string): Promise<void> {
  const { token, hash } = newOpaqueToken();
  const expiresAt = new Date(Date.now() + STAFF_SESSION_TTL_MS);
  await db.insert(staffSessions).values({ tokenHash: hash, staffId, expiresAt });
  res.setHeader('Set-Cookie', buildCookie(STAFF_COOKIE, token, STAFF_SESSION_TTL_SECONDS));
}

/**
 * Delete the staff session row for the cookie present on the request and
 * clear the cookie. Safe to call even when the cookie is missing.
 */
export async function clearStaffSession(req: VercelRequest, res: VercelResponse): Promise<void> {
  const cookies = parseCookies(req);
  const token = cookies[STAFF_COOKIE];
  if (token) {
    const hash = hashOpaqueToken(token);
    await db.delete(staffSessions).where(eq(staffSessions.tokenHash, hash));
  }
  res.setHeader('Set-Cookie', buildCookie(STAFF_COOKIE, '', 0));
}

export async function getStaffPrincipal(req: VercelRequest): Promise<StaffPrincipal | null> {
  const cookies = parseCookies(req);
  const token = cookies[STAFF_COOKIE];
  if (!token) return null;
  const hash = hashOpaqueToken(token);
  const now = new Date();
  const rows = await db
    .select({
      staffId: staffSessions.staffId,
      role: staffUsers.role,
      isActive: staffUsers.isActive,
    })
    .from(staffSessions)
    .innerJoin(staffUsers, eq(staffUsers.id, staffSessions.staffId))
    .where(and(eq(staffSessions.tokenHash, hash), gt(staffSessions.expiresAt, now)))
    .limit(1);
  const row = rows[0];
  if (!row || !row.isActive) return null;
  const role = row.role === 'admin' ? 'admin' : 'staff';
  return { id: row.staffId, role };
}

export async function getStaffId(req: VercelRequest): Promise<string | null> {
  const principal = await getStaffPrincipal(req);
  return principal ? principal.id : null;
}

export async function requireStaff(
  req: VercelRequest,
  res: VercelResponse,
): Promise<StaffPrincipal | null> {
  const principal = await getStaffPrincipal(req);
  if (!principal) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return principal;
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
): Promise<StaffPrincipal | null> {
  const principal = await getStaffPrincipal(req);
  if (!principal) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  if (principal.role !== 'admin') {
    res.status(403).json({ error: 'forbidden' });
    return null;
  }
  return principal;
}

export { CUSTOMER_COOKIE, STAFF_COOKIE };
