import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../../db/client';
import { staffSessions, staffUsers } from '../../db/schema';
import {
  hashOpaqueToken,
  newOpaqueToken,
  signSession,
  verifySession,
  type CustomerSessionClaims,
} from '../../lib/jwt';

const CUSTOMER_COOKIE = 'gh_session';
const STAFF_COOKIE = 'gh_staff';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const STAFF_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const STAFF_SESSION_TTL_MS = STAFF_SESSION_TTL_SECONDS * 1000;

export interface StaffPrincipal {
  id: string;
  role: 'staff' | 'admin';
}

export type AppVariables = {
  customerId: string;
  staff: StaffPrincipal;
};

function cookieOpts(maxAgeSeconds: number): CookieOptions {
  const opts: CookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: maxAgeSeconds,
  };
  if (process.env.VERCEL_ENV !== 'development') opts.secure = true;
  return opts;
}

export async function setCustomerSession(c: Context, customerId: string): Promise<void> {
  const token = await signSession({ sub: customerId, kind: 'customer' }, SESSION_TTL_SECONDS);
  setCookie(c, CUSTOMER_COOKIE, token, cookieOpts(SESSION_TTL_SECONDS));
}

export function clearCustomerSession(c: Context): void {
  // Match the prior format byte-for-byte: gh_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0
  setCookie(c, CUSTOMER_COOKIE, '', cookieOpts(0));
}

export async function getCustomerId(c: Context): Promise<string | null> {
  const token = getCookie(c, CUSTOMER_COOKIE);
  if (!token) return null;
  try {
    const claims = await verifySession<CustomerSessionClaims>(token);
    return claims.kind === 'customer' ? claims.sub : null;
  } catch {
    return null;
  }
}

export const requireCustomer: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const id = await getCustomerId(c);
  if (!id) return c.json({ error: 'unauthorized' }, 401);
  c.set('customerId', id);
  await next();
};

export async function setStaffSession(c: Context, staffId: string): Promise<void> {
  const { token, hash } = newOpaqueToken();
  const expiresAt = new Date(Date.now() + STAFF_SESSION_TTL_MS);
  await db.insert(staffSessions).values({ tokenHash: hash, staffId, expiresAt });
  setCookie(c, STAFF_COOKIE, token, cookieOpts(STAFF_SESSION_TTL_SECONDS));
}

export async function clearStaffSession(c: Context): Promise<void> {
  const token = getCookie(c, STAFF_COOKIE);
  if (token) {
    const hash = hashOpaqueToken(token);
    await db.delete(staffSessions).where(eq(staffSessions.tokenHash, hash));
  }
  setCookie(c, STAFF_COOKIE, '', cookieOpts(0));
}

export async function getStaffPrincipal(c: Context): Promise<StaffPrincipal | null> {
  const token = getCookie(c, STAFF_COOKIE);
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

export const requireStaff: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const principal = await getStaffPrincipal(c);
  if (!principal) return c.json({ error: 'unauthorized' }, 401);
  c.set('staff', principal);
  await next();
};

export const requireAdmin: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const principal = await getStaffPrincipal(c);
  if (!principal) return c.json({ error: 'unauthorized' }, 401);
  if (principal.role !== 'admin') return c.json({ error: 'forbidden' }, 403);
  c.set('staff', principal);
  await next();
};

export { CUSTOMER_COOKIE, STAFF_COOKIE };
