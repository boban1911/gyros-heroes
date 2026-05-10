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

const ADMIN_ID = '00000000-0000-0000-0000-0000000000a1';

function pushAdminPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'admin', isActive: true }]);
}

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'staff', isActive: true }]);
}

describe('GET /api/admin/config', () => {
  it('returns the loyalty config row for admin', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: 1,
        stampsRequired: 10,
        rewardDescription: 'Besplatan Hero gyros',
        scanCooldownSeconds: 1800,
        qrTokenTtlSeconds: 60,
        updatedAt: new Date('2026-05-01T12:00:00Z'),
      },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET', cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { stampsRequired: number; rewardDescription: string };
    expect(body.stampsRequired).toBe(10);
    expect(body.rewardDescription).toBe('Besplatan Hero gyros');
  });

  it('no cookie → 401', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
  });

  it('non-admin staff → 403', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    pushStaffPrincipal();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET', cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(403);
    expect(jsonBody()).toEqual({ error: 'forbidden' });
  });

  it('disallowed method → 405', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(undefined, { method: 'DELETE' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
    expect(jsonBody()).toEqual({ error: 'method_not_allowed' });
  });
});

describe('PUT /api/admin/config', () => {
  it('updates and returns the row', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: 1,
        stampsRequired: 8,
        rewardDescription: 'Free wrap',
        scanCooldownSeconds: 600,
        qrTokenTtlSeconds: 90,
        updatedAt: new Date('2026-05-08T12:00:00Z'),
      },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        {
          stampsRequired: 8,
          rewardDescription: 'Free wrap',
          scanCooldownSeconds: 600,
          qrTokenTtlSeconds: 90,
        },
        { method: 'PUT', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { stampsRequired: number; rewardDescription: string };
    expect(body.stampsRequired).toBe(8);
    expect(body.rewardDescription).toBe('Free wrap');
    const setPayload = dbMock.updateSets[0] as { stampsRequired: number };
    expect(setPayload.stampsRequired).toBe(8);
  });

  it('rejects empty rewardDescription', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    pushAdminPrincipal();

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        {
          stampsRequired: 10,
          rewardDescription: '   ',
          scanCooldownSeconds: 1800,
          qrTokenTtlSeconds: 60,
        },
        { method: 'PUT', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(400);
    const body = jsonBody() as { error: string };
    expect(body.error).toBe('invalid_input');
  });

  it('rejects out-of-range numbers', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    pushAdminPrincipal();

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(
        {
          stampsRequired: 0,
          rewardDescription: 'ok',
          scanCooldownSeconds: 1800,
          qrTokenTtlSeconds: 60,
        },
        { method: 'PUT', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(400);
    const body = jsonBody() as { error: string };
    expect(body.error).toBe('invalid_input');
  });

  it('non-admin → 403', async () => {
    const handler = (await import('../../../api/admin/config')).default;
    pushStaffPrincipal();
    const { res, statusCode } = makeRes();
    await handler(
      makeReq(
        {
          stampsRequired: 10,
          rewardDescription: 'ok',
          scanCooldownSeconds: 1800,
          qrTokenTtlSeconds: 60,
        },
        { method: 'PUT', cookie: 'gh_staff=valid' },
      ) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(403);
  });
});
