// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDb, type FakeDb } from '../../lib/fakeDb';

let dbMock: FakeDb;

vi.mock('../../../db/client', () => ({
  get db() {
    return dbMock.db;
  },
  schema: {},
}));

const applyActiveVisualMock = vi.fn(async () => {});
vi.mock('../../../lib/wallet/passVisual', () => ({
  applyActiveVisual: applyActiveVisualMock,
  applyReadyToRedeemVisual: vi.fn(),
}));

const STAFF_ID = '11111111-1111-4111-8111-111111111111';
const CUSTOMER_ID = '22222222-2222-4222-8222-222222222222';
const CARD_ID = '33333333-3333-4333-8333-333333333333';

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: STAFF_ID, role: 'staff', isActive: true }]);
}

beforeEach(() => {
  dbMock = createFakeDb();
  applyActiveVisualMock.mockClear();
});

async function loadApp() {
  return (await import('../../../server/app')).default;
}

describe('POST /api/staff/redeem', () => {
  it('happy path: flips ready_to_redeem → active and reverts the wallet visual', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    dbMock.queue.push([
      { id: CARD_ID, customerId: CUSTOMER_ID, googleObjectId: 'iss.card_xyz' },
    ]);
    dbMock.queue.push(undefined);
    dbMock.queue.push([{ name: 'Marko' }]);

    const res = await app.request('/api/staff/redeem', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: CARD_ID }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, cardId: CARD_ID, customerName: 'Marko' });
    expect(applyActiveVisualMock).toHaveBeenCalledTimes(1);
    expect(applyActiveVisualMock).toHaveBeenCalledWith('iss.card_xyz');
  });

  it('flips successfully but customer has no saved wallet pass — visual call is skipped', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    dbMock.queue.push([
      { id: CARD_ID, customerId: CUSTOMER_ID, googleObjectId: null },
    ]);
    dbMock.queue.push(undefined);
    dbMock.queue.push([{ name: 'Ana' }]);

    const res = await app.request('/api/staff/redeem', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: CARD_ID }),
    });

    expect(res.status).toBe(200);
    expect(applyActiveVisualMock).not.toHaveBeenCalled();
  });

  it('not_ready_to_redeem (atomic flip returns no row but card exists) → 409, no visual call', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    dbMock.queue.push([]);
    dbMock.queue.push([{ id: CARD_ID }]);

    const res = await app.request('/api/staff/redeem', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: CARD_ID }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'not_ready_to_redeem' });
    expect(applyActiveVisualMock).not.toHaveBeenCalled();
  });

  it('card not found → 404, no visual call', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    dbMock.queue.push([]);
    dbMock.queue.push([]);

    const res = await app.request('/api/staff/redeem', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: CARD_ID }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'card_not_found' });
    expect(applyActiveVisualMock).not.toHaveBeenCalled();
  });

  it('non-POST → 405', async () => {
    const app = await loadApp();
    const res = await app.request('/api/staff/redeem', { method: 'GET' });
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'method_not_allowed' });
  });
});
