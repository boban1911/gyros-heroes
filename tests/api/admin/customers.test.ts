// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDb, type FakeDb } from '../../lib/fakeDb';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';

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

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const CUSTOMER_A = '33333333-3333-4333-8333-333333333333';
const CUSTOMER_B = '44444444-4444-4444-8444-444444444444';
const CARD_A = '55555555-5555-4555-8555-555555555555';

function pushAdminPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'admin', isActive: true }]);
}

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'staff', isActive: true }]);
}

async function loadApp() {
  return (await import('../../../server/app')).default;
}

describe('GET /api/admin/customers', () => {
  it('returns customers with card aggregates and lastStampAt merged', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: CUSTOMER_A,
        email: 'a@gh.rs',
        name: 'A',
        emailVerifiedAt: new Date('2026-05-01T10:00:00Z'),
        createdAt: new Date('2026-05-01T10:00:00Z'),
        cardId: CARD_A,
        stampsCount: 3,
        totalRedemptions: 1,
        status: 'active',
        googleObjectId: 'go-1',
        cardCreatedAt: new Date('2026-05-01T10:05:00Z'),
      },
      {
        id: CUSTOMER_B,
        email: 'b@gh.rs',
        name: 'B',
        emailVerifiedAt: null,
        createdAt: new Date('2026-04-20T10:00:00Z'),
        cardId: null,
        stampsCount: null,
        totalRedemptions: null,
        status: null,
        googleObjectId: null,
        cardCreatedAt: null,
      },
    ]);
    dbMock.queue.push([{ cardId: CARD_A, lastStampAt: new Date('2026-05-02T12:00:00Z') }]);

    const res = await app.request('/api/admin/customers', {
      method: 'GET',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { customers: Array<Record<string, unknown>> };
    expect(body.customers).toHaveLength(2);
    expect(body.customers[0].id).toBe(CUSTOMER_A);
    const cardA = body.customers[0].card as Record<string, unknown>;
    expect(cardA.stampsCount).toBe(3);
    expect(cardA.totalRedemptions).toBe(1);
    expect(cardA.hasWalletPass).toBe(true);
    expect(cardA.lastStampAt).toBe('2026-05-02T12:00:00.000Z');
    expect(body.customers[1].card).toBeNull();
  });

  it('no cookie → 401', async () => {
    const app = await loadApp();
    const res = await app.request('/api/admin/customers', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  it('non-admin → 403', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    const res = await app.request('/api/admin/customers', {
      method: 'GET',
      headers: { cookie: 'gh_staff=valid' },
    });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/admin/customers', () => {
  it('admin force-delete: expires wallet pass and cascades DB delete', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([{ id: CUSTOMER_A }]);
    dbMock.queue.push([{ googleObjectId: 'go-1' }]);

    const res = await app.request(`/api/admin/customers?id=${CUSTOMER_A}`, {
      method: 'DELETE',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(expirePassMock).toHaveBeenCalledWith('go-1');
    expect(dbMock.deleteSpy).toHaveBeenCalled();
  });

  it('skips expirePass when no wallet pass exists', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([{ id: CUSTOMER_A }]);
    dbMock.queue.push([{ googleObjectId: null }]);

    const res = await app.request(`/api/admin/customers?id=${CUSTOMER_A}`, {
      method: 'DELETE',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(200);
    expect(expirePassMock).not.toHaveBeenCalled();
    expect(dbMock.deleteSpy).toHaveBeenCalled();
  });

  it('returns 404 when customer not found', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([]);

    const res = await app.request(`/api/admin/customers?id=${CUSTOMER_A}`, {
      method: 'DELETE',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(404);
    expect(((await res.json()) as { error: string }).error).toBe('customer_not_found');
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for missing or invalid id', async () => {
    const app = await loadApp();
    pushAdminPrincipal();

    const res = await app.request('/api/admin/customers?id=not-a-uuid', {
      method: 'DELETE',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe('invalid_id');
  });

  it('non-admin → 403', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    const res = await app.request(`/api/admin/customers?id=${CUSTOMER_A}`, {
      method: 'DELETE',
      headers: { cookie: 'gh_staff=valid' },
    });
    expect(res.status).toBe(403);
  });
});

describe('method routing', () => {
  it('PUT → 405 with Allow header', async () => {
    const app = await loadApp();
    const res = await app.request('/api/admin/customers', { method: 'PUT' });
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET, DELETE');
  });
});
