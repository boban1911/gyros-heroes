// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDb, type FakeDb } from '../../lib/fakeDb';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';

let dbMock: FakeDb;

vi.mock('../../../db/client', () => ({
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
});

afterEach(() => {
  vi.useRealTimers();
});

interface JsonResponse {
  status: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function makeRes(): { res: JsonResponse; statusCode: () => number | null; jsonBody: () => unknown } {
  let code: number | null = null;
  let body: unknown = undefined;
  const res: JsonResponse = {
    status: vi.fn((s: number) => {
      code = s;
      return res;
    }),
    setHeader: vi.fn(),
    json: vi.fn((b: unknown) => {
      body = b;
      return res;
    }),
  };
  return { res, statusCode: () => code, jsonBody: () => body };
}

function makeReq(body: unknown, opts: { method?: string; cookie?: string } = {}): {
  method: string;
  body: unknown;
  headers: { cookie?: string };
} {
  return {
    method: opts.method ?? 'GET',
    body,
    headers: opts.cookie ? { cookie: opts.cookie } : {},
  };
}

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';

function pushAdminPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'admin', isActive: true }]);
}

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'staff', isActive: true }]);
}

describe('GET /api/admin/staff', () => {
  it('returns list ordered by createdAt desc, no passwordHash', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: ADMIN_ID,
        email: 'admin@gh.rs',
        name: 'Admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        id: OTHER_ID,
        email: 'staff@gh.rs',
        name: 'Staff',
        role: 'staff',
        isActive: true,
        createdAt: new Date('2026-04-20T10:00:00Z'),
      },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET', cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { staff: Array<Record<string, unknown>> };
    expect(body.staff).toHaveLength(2);
    expect(body.staff[0]).not.toHaveProperty('passwordHash');
    expect(body.staff[0].email).toBe('admin@gh.rs');
  });

  it('no cookie → 401', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    const { res, statusCode } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(401);
  });

  it('non-admin → 403', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushStaffPrincipal();
    const { res, statusCode } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET', cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(403);
  });
});

describe('POST /api/admin/staff', () => {
  it('creates new staff and returns row without passwordHash', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();
    // duplicate-check select: empty
    dbMock.queue.push([]);
    // insert .returning
    dbMock.queue.push([
      {
        id: OTHER_ID,
        email: 'new@gh.rs',
        name: 'Nova',
        role: 'staff',
        isActive: true,
        createdAt: new Date('2026-05-08T11:00:00Z'),
      },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        { email: 'new@gh.rs', name: 'Nova', password: 'secret-pass-123', role: 'staff' },
        { method: 'POST', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(201);
    const body = jsonBody() as Record<string, unknown>;
    expect(body).not.toHaveProperty('passwordHash');
    expect(body.email).toBe('new@gh.rs');
    const inserted = dbMock.insertValues[0] as { email: string; passwordHash: string };
    expect(inserted.email).toBe('new@gh.rs');
    expect(typeof inserted.passwordHash).toBe('string');
    expect(inserted.passwordHash.length).toBeGreaterThan(20);
  });

  it('duplicate email → 409', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();
    dbMock.queue.push([{ id: OTHER_ID }]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        { email: 'dup@gh.rs', name: 'Dup', password: 'secret-pass-123', role: 'staff' },
        { method: 'POST', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(409);
    expect(jsonBody()).toEqual({ error: 'email_already_exists' });
  });

  it('rejects invalid role/short password', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        { email: 'x@gh.rs', name: 'X', password: 'short', role: 'staff' },
        { method: 'POST', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(400);
    const body = jsonBody() as { error: string };
    expect(body.error).toBe('invalid_input');
  });
});

describe('PATCH /api/admin/staff', () => {
  it('toggles isActive on another user', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: OTHER_ID,
        email: 's@gh.rs',
        name: 'S',
        role: 'staff',
        isActive: false,
        createdAt: new Date('2026-04-01T10:00:00Z'),
      },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        { id: OTHER_ID, isActive: false },
        { method: 'PATCH', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as Record<string, unknown>;
    expect(body.isActive).toBe(false);
    expect(body).not.toHaveProperty('passwordHash');
  });

  it('refuses self-deactivation', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        { id: ADMIN_ID, isActive: false },
        { method: 'PATCH', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(400);
    expect(jsonBody()).toEqual({ error: 'cannot_deactivate_self' });
  });

  it('allows reactivating self', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: ADMIN_ID,
        email: 'admin@gh.rs',
        name: 'Admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2026-04-01T10:00:00Z'),
      },
    ]);

    const { res, statusCode } = makeRes();
    await handler(
      makeReq(
        { id: ADMIN_ID, isActive: true },
        { method: 'PATCH', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
  });

  it('staff (non-admin) → 403', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    pushStaffPrincipal();
    const { res, statusCode } = makeRes();
    await handler(
      makeReq(
        { id: OTHER_ID, isActive: false },
        { method: 'PATCH', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(403);
  });
});

describe('method handling', () => {
  it('unsupported method → 405', async () => {
    const handler = (await import('../../../api/admin/staff')).default;
    const { res, statusCode } = makeRes();
    await handler(
      makeReq(undefined, { method: 'DELETE' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
  });
});
