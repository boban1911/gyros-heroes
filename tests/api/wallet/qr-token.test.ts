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

const CUSTOMER_ID = '11111111-1111-1111-1111-111111111111';
const CARD_ID = '22222222-2222-2222-2222-222222222222';

async function mintCustomerCookie(): Promise<string> {
  const { signSession } = await import('../../../lib/jwt');
  const token = await signSession({ sub: CUSTOMER_ID, kind: 'customer' }, 60 * 60 * 24 * 30);
  return `gh_session=${token}`;
}

async function loadApp() {
  return (await import('../../../server/app')).default;
}

describe('GET /api/wallet/google/qr-token', () => {
  it('mints a valid JWT, inserts a qr_tokens row, returns token + jti + iat + exp', async () => {
    const app = await loadApp();
    const { verifyQrToken } = await import('../../../lib/jwt');

    dbMock.queue.push([{ id: CARD_ID }]);
    dbMock.queue.push([{ qrTokenTtlSeconds: 60 }]);
    dbMock.queue.push(undefined);

    const cookie = await mintCustomerCookie();
    const res = await app.request('/api/wallet/google/qr-token', {
      method: 'GET',
      headers: { cookie },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { token: string; jti: string; iat: number; exp: number };
    expect(typeof body.token).toBe('string');
    expect(body.token.split('.')).toHaveLength(3);
    expect(typeof body.jti).toBe('string');
    expect(body.exp - body.iat).toBe(60);

    const claims = await verifyQrToken(body.token);
    expect(claims.cardId).toBe(CARD_ID);
    expect(claims.jti).toBe(body.jti);

    expect(dbMock.insertSpy).toHaveBeenCalledTimes(1);
    expect(dbMock.insertValues).toHaveLength(1);
    const inserted = dbMock.insertValues[0] as { jti: string; cardId: string; expiresAt: Date };
    expect(inserted.jti).toBe(body.jti);
    expect(inserted.cardId).toBe(CARD_ID);
    expect(inserted.expiresAt).toBeInstanceOf(Date);
    expect(Math.round(inserted.expiresAt.getTime() / 1000)).toBe(body.exp);
  });

  it('falls back to 60s TTL when loyalty_config row is missing', async () => {
    const app = await loadApp();
    dbMock.queue.push([{ id: CARD_ID }]);
    dbMock.queue.push([]);
    dbMock.queue.push(undefined);

    const cookie = await mintCustomerCookie();
    const res = await app.request('/api/wallet/google/qr-token', {
      method: 'GET',
      headers: { cookie },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { iat: number; exp: number };
    expect(body.exp - body.iat).toBe(60);
  });

  it('respects custom qrTokenTtlSeconds from config', async () => {
    const app = await loadApp();
    dbMock.queue.push([{ id: CARD_ID }]);
    dbMock.queue.push([{ qrTokenTtlSeconds: 120 }]);
    dbMock.queue.push(undefined);

    const cookie = await mintCustomerCookie();
    const res = await app.request('/api/wallet/google/qr-token', {
      method: 'GET',
      headers: { cookie },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { iat: number; exp: number };
    expect(body.exp - body.iat).toBe(120);
  });

  it('unauthorized (no cookie) → 401', async () => {
    const app = await loadApp();
    const res = await app.request('/api/wallet/google/qr-token', { method: 'GET' });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    expect(dbMock.selectSpy).not.toHaveBeenCalled();
  });

  it('unauthorized (malformed cookie token) → 401', async () => {
    const app = await loadApp();
    const res = await app.request('/api/wallet/google/qr-token', {
      method: 'GET',
      headers: { cookie: 'gh_session=not-a-real-jwt' },
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('customer with no loyalty_cards row → 404 card_not_found', async () => {
    const app = await loadApp();
    dbMock.queue.push([]);

    const cookie = await mintCustomerCookie();
    const res = await app.request('/api/wallet/google/qr-token', {
      method: 'GET',
      headers: { cookie },
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'card_not_found' });
    expect(dbMock.insertSpy).not.toHaveBeenCalled();
  });

  it('non-GET method → 405', async () => {
    const app = await loadApp();
    const res = await app.request('/api/wallet/google/qr-token', { method: 'POST' });
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'method_not_allowed' });
  });
});
