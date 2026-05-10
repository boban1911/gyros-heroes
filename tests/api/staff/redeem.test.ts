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
    method: opts.method ?? 'POST',
    body,
    headers: opts.cookie ? { cookie: opts.cookie } : {},
  };
}

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

describe('POST /api/staff/redeem', () => {
  it('happy path: flips ready_to_redeem → active and reverts the wallet visual', async () => {
    const handler = (await import('../../../api/staff/redeem')).default;

    pushStaffPrincipal();
    // 1. Atomic UPDATE ... RETURNING — one row flipped, includes googleObjectId.
    dbMock.queue.push([
      { id: CARD_ID, customerId: CUSTOMER_ID, googleObjectId: 'iss.card_xyz' },
    ]);
    // 2. stamp_events insert
    dbMock.queue.push(undefined);
    // 3. customer name lookup
    dbMock.queue.push([{ name: 'Marko' }]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cardId: CARD_ID }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(jsonBody()).toEqual({ ok: true, cardId: CARD_ID, customerName: 'Marko' });
    expect(applyActiveVisualMock).toHaveBeenCalledTimes(1);
    expect(applyActiveVisualMock).toHaveBeenCalledWith('iss.card_xyz');
  });

  it('flips successfully but customer has no saved wallet pass — visual call is skipped', async () => {
    const handler = (await import('../../../api/staff/redeem')).default;

    pushStaffPrincipal();
    dbMock.queue.push([
      { id: CARD_ID, customerId: CUSTOMER_ID, googleObjectId: null },
    ]);
    dbMock.queue.push(undefined);
    dbMock.queue.push([{ name: 'Ana' }]);

    const { res, statusCode } = makeRes();
    await handler(
      makeReq({ cardId: CARD_ID }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(applyActiveVisualMock).not.toHaveBeenCalled();
  });

  it('not_ready_to_redeem (atomic flip returns no row but card exists) → 409, no visual call', async () => {
    const handler = (await import('../../../api/staff/redeem')).default;

    pushStaffPrincipal();
    dbMock.queue.push([]); // no row flipped
    dbMock.queue.push([{ id: CARD_ID }]); // existence probe finds the card

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cardId: CARD_ID }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(409);
    expect(jsonBody()).toEqual({ error: 'not_ready_to_redeem' });
    expect(applyActiveVisualMock).not.toHaveBeenCalled();
  });

  it('card not found → 404, no visual call', async () => {
    const handler = (await import('../../../api/staff/redeem')).default;

    pushStaffPrincipal();
    dbMock.queue.push([]); // flip returns nothing
    dbMock.queue.push([]); // existence probe also empty

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ cardId: CARD_ID }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(404);
    expect(jsonBody()).toEqual({ error: 'card_not_found' });
    expect(applyActiveVisualMock).not.toHaveBeenCalled();
  });

  it('non-POST → 405', async () => {
    const handler = (await import('../../../api/staff/redeem')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({}, { method: 'GET' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
    expect(jsonBody()).toEqual({ error: 'method_not_allowed' });
  });
});
