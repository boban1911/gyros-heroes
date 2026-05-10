// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { signSession } from '../../../lib/jwt';
import { createFakeDb, type FakeDb } from '../../lib/fakeDb';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';
const CUSTOMER_ID = '00000000-0000-0000-0000-0000000000c1';

let dbMock: FakeDb;
const expirePassMock = vi.fn();

vi.mock('../../../db/client', () => ({
  get db() {
    return dbMock.db;
  },
  schema: {},
}));

vi.mock('../../../lib/wallet/passLifecycle', () => ({
  expirePass: (...args: unknown[]) => expirePassMock(...args),
}));

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

beforeEach(() => {
  dbMock = createFakeDb();
  expirePassMock.mockReset();
  expirePassMock.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

interface JsonResponse {
  status: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
}

function makeRes(): {
  res: JsonResponse;
  statusCode: () => number | null;
  jsonBody: () => unknown;
  setHeaders: () => Array<[string, unknown]>;
} {
  let code: number | null = null;
  let body: unknown = undefined;
  const headers: Array<[string, unknown]> = [];
  const res: JsonResponse = {
    status: vi.fn((s: number) => {
      code = s;
      return res;
    }),
    setHeader: vi.fn((name: string, value: unknown) => {
      headers.push([name, value]);
      return res;
    }),
    json: vi.fn((b: unknown) => {
      body = b;
      return res;
    }),
  };
  return { res, statusCode: () => code, jsonBody: () => body, setHeaders: () => headers };
}

function makeReq(
  body: unknown,
  opts: { method?: string; cookie?: string } = {},
): { method: string; body: unknown; headers: { cookie?: string } } {
  return {
    method: opts.method ?? 'DELETE',
    body,
    headers: opts.cookie ? { cookie: opts.cookie } : {},
  };
}

async function customerCookie(): Promise<string> {
  const token = await signSession({ sub: CUSTOMER_ID, kind: 'customer' }, 60);
  return `gh_session=${token}`;
}

describe('DELETE /api/account/delete', () => {
  it('rejects GET with 405 + Allow: DELETE', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const { res, statusCode, jsonBody, setHeaders } = makeRes();
    await handler(
      makeReq(undefined, { method: 'GET' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
    expect(jsonBody()).toEqual({ error: 'method_not_allowed' });
    expect(setHeaders()).toContainEqual(['Allow', 'DELETE']);
  });

  it('rejects POST with 405 + Allow: DELETE', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const { res, statusCode, setHeaders } = makeRes();
    await handler(
      makeReq({ confirm: 'OBRIŠI' }, { method: 'POST' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
    expect(setHeaders()).toContainEqual(['Allow', 'DELETE']);
  });

  it('returns 401 when no session cookie', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ confirm: 'OBRIŠI' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('returns 400 confirmation_required when body lacks the magic word', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const cookie = await customerCookie();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ confirm: 'delete' }, { cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(400);
    expect(jsonBody()).toEqual({ error: 'confirmation_required' });
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('returns 400 when body is empty', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const cookie = await customerCookie();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq(undefined, { cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(400);
    expect(jsonBody()).toEqual({ error: 'confirmation_required' });
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('happy path: expires wallet pass, deletes customer, clears cookie, returns ok', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const cookie = await customerCookie();
    // 1) select googleObjectId, 2) delete customers.
    dbMock.queue.push([{ googleObjectId: 'issuer.obj-happy' }]);
    dbMock.queue.push(undefined);

    const { res, statusCode, jsonBody, setHeaders } = makeRes();
    await handler(
      makeReq({ confirm: 'OBRIŠI' }, { cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(jsonBody()).toEqual({ ok: true });
    expect(expirePassMock).toHaveBeenCalledTimes(1);
    expect(expirePassMock).toHaveBeenCalledWith('issuer.obj-happy');
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);

    const setCookie = setHeaders().find(([name]) => name === 'Set-Cookie');
    expect(setCookie).toBeDefined();
    const cookieValue = String(setCookie?.[1] ?? '');
    expect(cookieValue).toMatch(/^gh_session=;/);
    expect(cookieValue).toMatch(/Max-Age=0/);
    expect(cookieValue).toMatch(/Path=\//);
    expect(cookieValue).toMatch(/SameSite=Lax/);
  });

  it('skips wallet expire when customer has no saved Google Wallet pass', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const cookie = await customerCookie();
    // googleObjectId is null — never saved a wallet pass.
    dbMock.queue.push([{ googleObjectId: null }]);
    dbMock.queue.push(undefined);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ confirm: 'OBRIŠI' }, { cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(jsonBody()).toEqual({ ok: true });
    expect(expirePassMock).not.toHaveBeenCalled();
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('still completes deletion when expirePass rejects', async () => {
    const handler = (await import('../../../api/account/delete')).default;
    const cookie = await customerCookie();
    dbMock.queue.push([{ googleObjectId: 'issuer.obj-broken' }]);
    dbMock.queue.push(undefined);
    expirePassMock.mockRejectedValueOnce(new Error('wallet down'));

    const { res, statusCode, jsonBody, setHeaders } = makeRes();
    await handler(
      makeReq({ confirm: 'OBRIŠI' }, { cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(jsonBody()).toEqual({ ok: true });
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);

    const setCookie = setHeaders().find(([name]) => name === 'Set-Cookie');
    expect(setCookie).toBeDefined();
    expect(String(setCookie?.[1] ?? '')).toMatch(/^gh_session=;/);
  });
});
