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

function makeReq(opts: { method?: string; cookie?: string } = {}): {
  method: string;
  headers: { cookie?: string };
} {
  return {
    method: opts.method ?? 'GET',
    headers: opts.cookie ? { cookie: opts.cookie } : {},
  };
}

const CUSTOMER_ID = '11111111-1111-1111-1111-111111111111';
const CARD_ID = '22222222-2222-2222-2222-222222222222';

async function mintCustomerCookie(): Promise<string> {
  const { signSession } = await import('../../../lib/jwt');
  // 30-day TTL mirrors lib/auth's customer cookie default; only the value is
  // material here since the request handler verifies it.
  const token = await signSession({ sub: CUSTOMER_ID, kind: 'customer' }, 60 * 60 * 24 * 30);
  return `gh_session=${token}`;
}

describe('GET /api/wallet/google/qr-token', () => {
  it('mints a valid JWT, inserts a qr_tokens row, returns token + jti + iat + exp', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;
    const { verifyQrToken } = await import('../../../lib/jwt');

    // 1. customer card lookup
    dbMock.queue.push([{ id: CARD_ID }]);
    // 2. loyalty config lookup
    dbMock.queue.push([{ qrTokenTtlSeconds: 60 }]);
    // 3. qr_tokens insert
    dbMock.queue.push(undefined);

    const cookie = await mintCustomerCookie();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { token: string; jti: string; iat: number; exp: number };
    expect(typeof body.token).toBe('string');
    expect(body.token.split('.')).toHaveLength(3);
    expect(typeof body.jti).toBe('string');
    expect(body.exp - body.iat).toBe(60);

    // The minted JWT should round-trip with our verifier.
    const claims = await verifyQrToken(body.token);
    expect(claims.cardId).toBe(CARD_ID);
    expect(claims.jti).toBe(body.jti);

    // qr_tokens insert payload must reference the same jti and card.
    expect(dbMock.insertSpy).toHaveBeenCalledTimes(1);
    expect(dbMock.insertValues).toHaveLength(1);
    const inserted = dbMock.insertValues[0] as { jti: string; cardId: string; expiresAt: Date };
    expect(inserted.jti).toBe(body.jti);
    expect(inserted.cardId).toBe(CARD_ID);
    expect(inserted.expiresAt).toBeInstanceOf(Date);
    expect(Math.round(inserted.expiresAt.getTime() / 1000)).toBe(body.exp);
  });

  it('falls back to 60s TTL when loyalty_config row is missing', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;

    dbMock.queue.push([{ id: CARD_ID }]);
    dbMock.queue.push([]); // no config row
    dbMock.queue.push(undefined);

    const cookie = await mintCustomerCookie();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { iat: number; exp: number };
    expect(body.exp - body.iat).toBe(60);
  });

  it('respects custom qrTokenTtlSeconds from config', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;

    dbMock.queue.push([{ id: CARD_ID }]);
    dbMock.queue.push([{ qrTokenTtlSeconds: 120 }]);
    dbMock.queue.push(undefined);

    const cookie = await mintCustomerCookie();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { iat: number; exp: number };
    expect(body.exp - body.iat).toBe(120);
  });

  it('unauthorized (no cookie) → 401', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq() as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
    expect(dbMock.selectSpy).not.toHaveBeenCalled();
  });

  it('unauthorized (malformed cookie token) → 401', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cookie: 'gh_session=not-a-real-jwt' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
  });

  it('customer with no loyalty_cards row → 404 card_not_found', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;

    // Card lookup returns empty.
    dbMock.queue.push([]);

    const cookie = await mintCustomerCookie();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cookie }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(404);
    expect(jsonBody()).toEqual({ error: 'card_not_found' });
    // No insert should have happened on the 404 path.
    expect(dbMock.insertSpy).not.toHaveBeenCalled();
  });

  it('non-GET method → 405', async () => {
    const handler = (await import('../../../api/wallet/google/qr-token')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ method: 'POST' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
    expect(jsonBody()).toEqual({ error: 'method_not_allowed' });
  });
});
