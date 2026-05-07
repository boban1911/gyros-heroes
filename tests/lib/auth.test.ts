// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDb, type FakeDb } from './fakeDb';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';

let dbMock: FakeDb;

vi.mock('../../db/client', () => ({
  get db() {
    return dbMock.db;
  },
  schema: {},
}));

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

beforeEach(() => {
  dbMock = createFakeDb();
  delete process.env.VERCEL_ENV;
});

afterEach(() => {
  vi.useRealTimers();
});

interface CookieAttrs {
  value: string;
  attrs: Map<string, string>;
  flags: Set<string>;
}

function parseCookieHeader(header: unknown): CookieAttrs {
  if (typeof header !== 'string') {
    throw new Error(`expected Set-Cookie string, got: ${String(header)}`);
  }
  const parts = header.split(';').map((p) => p.trim());
  const [first, ...rest] = parts;
  const eq = first.indexOf('=');
  const value = eq >= 0 ? decodeURIComponent(first.slice(eq + 1)) : '';
  const attrs = new Map<string, string>();
  const flags = new Set<string>();
  for (const part of rest) {
    const idx = part.indexOf('=');
    if (idx === -1) {
      flags.add(part);
    } else {
      attrs.set(part.slice(0, idx), part.slice(idx + 1));
    }
  }
  return { value, attrs, flags };
}

function makeRes(): { res: { setHeader: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> }; capturedCookie: () => unknown; statusCode: () => number | null; jsonBody: () => unknown } {
  let cookie: unknown = undefined;
  let code: number | null = null;
  let body: unknown = undefined;
  const res = {
    setHeader: vi.fn((name: string, val: unknown) => {
      if (name === 'Set-Cookie') cookie = val;
    }),
    status: vi.fn((s: number) => {
      code = s;
      return res;
    }),
    json: vi.fn((b: unknown) => {
      body = b;
      return res;
    }),
  };
  return {
    res,
    capturedCookie: () => cookie,
    statusCode: () => code,
    jsonBody: () => body,
  };
}

function makeReq(cookieHeader?: string): { headers: { cookie?: string } } {
  return { headers: cookieHeader ? { cookie: cookieHeader } : {} };
}

describe('setStaffSession', () => {
  it('writes a gh_staff cookie and inserts a staff_sessions row', async () => {
    const auth = await import('../../lib/auth');
    // First insert resolves to undefined.
    dbMock.queue.push(undefined);

    const { res, capturedCookie } = makeRes();
    await auth.setStaffSession(
      // The auth module only calls setHeader / status / json on res, so the
      // narrow shape above is enough for type-check via the cast at the call site.
      res as unknown as Parameters<typeof auth.setStaffSession>[0],
      'staff-uuid-1',
    );

    expect(dbMock.insertSpy).toHaveBeenCalledTimes(1);
    expect(dbMock.insertValues).toHaveLength(1);
    const inserted = dbMock.insertValues[0] as { tokenHash: string; staffId: string; expiresAt: Date };
    expect(inserted.staffId).toBe('staff-uuid-1');
    expect(inserted.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(inserted.expiresAt).toBeInstanceOf(Date);
    // 12h Max-Age
    const ttlMs = inserted.expiresAt.getTime() - Date.now();
    expect(ttlMs).toBeGreaterThan(11 * 60 * 60 * 1000);
    expect(ttlMs).toBeLessThanOrEqual(12 * 60 * 60 * 1000 + 1000);

    const parsed = parseCookieHeader(capturedCookie());
    // Cookie value is base64url; assert shape but not content.
    expect(parsed.value).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(parsed.flags.has('HttpOnly')).toBe(true);
    expect(parsed.flags.has('Secure')).toBe(true);
    expect(parsed.attrs.get('SameSite')).toBe('Lax');
    expect(parsed.attrs.get('Path')).toBe('/');
    expect(parsed.attrs.get('Max-Age')).toBe(String(60 * 60 * 12));
  });

  it('omits Secure when VERCEL_ENV=development', async () => {
    process.env.VERCEL_ENV = 'development';
    const auth = await import('../../lib/auth');
    dbMock.queue.push(undefined);
    const { res, capturedCookie } = makeRes();
    await auth.setStaffSession(res as unknown as Parameters<typeof auth.setStaffSession>[0], 'staff-uuid-2');
    const parsed = parseCookieHeader(capturedCookie());
    expect(parsed.flags.has('Secure')).toBe(false);
    expect(parsed.flags.has('HttpOnly')).toBe(true);
  });

  it('cookie name is gh_staff', async () => {
    const auth = await import('../../lib/auth');
    expect(auth.STAFF_COOKIE).toBe('gh_staff');
    dbMock.queue.push(undefined);
    const { res, capturedCookie } = makeRes();
    await auth.setStaffSession(res as unknown as Parameters<typeof auth.setStaffSession>[0], 'staff-uuid-3');
    expect(String(capturedCookie())).toMatch(/^gh_staff=/);
  });
});

describe('getStaffPrincipal', () => {
  it('returns staff principal when cookie hash matches a non-expired session', async () => {
    const auth = await import('../../lib/auth');
    // setStaffSession will mint a real token + insert; capture the token from the cookie.
    dbMock.queue.push(undefined);
    const { res: setRes, capturedCookie } = makeRes();
    await auth.setStaffSession(setRes as unknown as Parameters<typeof auth.setStaffSession>[0], 'staff-uuid-A');
    const cookieHeader = String(capturedCookie());
    const tokenValue = cookieHeader.split(';')[0].split('=')[1];
    expect(tokenValue.length).toBeGreaterThan(0);

    // The select chain in getStaffPrincipal returns one row.
    dbMock.queue.push([
      { staffId: 'staff-uuid-A', role: 'staff', isActive: true },
    ]);

    const principal = await auth.getStaffPrincipal(
      makeReq(`gh_staff=${tokenValue}`) as unknown as Parameters<typeof auth.getStaffPrincipal>[0],
    );
    expect(principal).toEqual({ id: 'staff-uuid-A', role: 'staff' });
  });

  it('coerces non-admin role values to staff', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([{ staffId: 'staff-X', role: 'admin', isActive: true }]);
    const principal = await auth.getStaffPrincipal(
      makeReq('gh_staff=anytoken') as unknown as Parameters<typeof auth.getStaffPrincipal>[0],
    );
    expect(principal).toEqual({ id: 'staff-X', role: 'admin' });
  });

  it('returns null when cookie is missing', async () => {
    const auth = await import('../../lib/auth');
    const principal = await auth.getStaffPrincipal(
      makeReq() as unknown as Parameters<typeof auth.getStaffPrincipal>[0],
    );
    expect(principal).toBeNull();
    expect(dbMock.selectSpy).not.toHaveBeenCalled();
  });

  it('returns null when no row matches the hash (expired or unknown)', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([]); // select resolves empty
    const principal = await auth.getStaffPrincipal(
      makeReq('gh_staff=stale-token') as unknown as Parameters<typeof auth.getStaffPrincipal>[0],
    );
    expect(principal).toBeNull();
  });

  it('returns null when staff is deactivated', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([{ staffId: 'staff-Y', role: 'staff', isActive: false }]);
    const principal = await auth.getStaffPrincipal(
      makeReq('gh_staff=tok') as unknown as Parameters<typeof auth.getStaffPrincipal>[0],
    );
    expect(principal).toBeNull();
  });
});

describe('requireStaff', () => {
  it('returns the principal on success without writing a response', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([{ staffId: 'staff-Z', role: 'staff', isActive: true }]);
    const { res, statusCode } = makeRes();
    const principal = await auth.requireStaff(
      makeReq('gh_staff=tok') as unknown as Parameters<typeof auth.requireStaff>[0],
      res as unknown as Parameters<typeof auth.requireStaff>[1],
    );
    expect(principal).toEqual({ id: 'staff-Z', role: 'staff' });
    expect(statusCode()).toBeNull();
  });

  it('responds 401 when no session', async () => {
    const auth = await import('../../lib/auth');
    const { res, statusCode, jsonBody } = makeRes();
    const principal = await auth.requireStaff(
      makeReq() as unknown as Parameters<typeof auth.requireStaff>[0],
      res as unknown as Parameters<typeof auth.requireStaff>[1],
    );
    expect(principal).toBeNull();
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
  });

  it('responds 401 when session row is missing/expired', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([]);
    const { res, statusCode, jsonBody } = makeRes();
    const principal = await auth.requireStaff(
      makeReq('gh_staff=oldtoken') as unknown as Parameters<typeof auth.requireStaff>[0],
      res as unknown as Parameters<typeof auth.requireStaff>[1],
    );
    expect(principal).toBeNull();
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
  });
});

describe('requireAdmin', () => {
  it('returns admin principal', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([{ staffId: 'admin-1', role: 'admin', isActive: true }]);
    const { res, statusCode } = makeRes();
    const principal = await auth.requireAdmin(
      makeReq('gh_staff=tok') as unknown as Parameters<typeof auth.requireAdmin>[0],
      res as unknown as Parameters<typeof auth.requireAdmin>[1],
    );
    expect(principal).toEqual({ id: 'admin-1', role: 'admin' });
    expect(statusCode()).toBeNull();
  });

  it('responds 403 when role is staff', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push([{ staffId: 'staff-1', role: 'staff', isActive: true }]);
    const { res, statusCode, jsonBody } = makeRes();
    const principal = await auth.requireAdmin(
      makeReq('gh_staff=tok') as unknown as Parameters<typeof auth.requireAdmin>[0],
      res as unknown as Parameters<typeof auth.requireAdmin>[1],
    );
    expect(principal).toBeNull();
    expect(statusCode()).toBe(403);
    expect(jsonBody()).toEqual({ error: 'forbidden' });
  });
});

describe('clearStaffSession', () => {
  it('deletes the session row and emits an expiring cookie', async () => {
    const auth = await import('../../lib/auth');
    dbMock.queue.push(undefined); // delete resolves
    const { res, capturedCookie } = makeRes();
    await auth.clearStaffSession(
      makeReq('gh_staff=some-token-value') as unknown as Parameters<typeof auth.clearStaffSession>[0],
      res as unknown as Parameters<typeof auth.clearStaffSession>[1],
    );
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);
    const parsed = parseCookieHeader(capturedCookie());
    expect(parsed.attrs.get('Max-Age')).toBe('0');
    expect(parsed.value).toBe('');
  });

  it('does not query the DB when cookie is absent but still clears it', async () => {
    const auth = await import('../../lib/auth');
    const { res, capturedCookie } = makeRes();
    await auth.clearStaffSession(
      makeReq() as unknown as Parameters<typeof auth.clearStaffSession>[0],
      res as unknown as Parameters<typeof auth.clearStaffSession>[1],
    );
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
    const parsed = parseCookieHeader(capturedCookie());
    expect(parsed.attrs.get('Max-Age')).toBe('0');
  });
});
