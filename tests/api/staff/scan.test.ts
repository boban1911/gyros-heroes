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
    method: opts.method ?? 'POST',
    body,
    headers: opts.cookie ? { cookie: opts.cookie } : {},
  };
}

const STAFF_ID = '00000000-0000-0000-0000-000000000001';
const CARD_ID = '00000000-0000-0000-0000-0000000000aa';

/**
 * Push the standard "authenticated staff" select result that
 * `requireStaff` consumes before any endpoint-specific queries.
 */
function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: STAFF_ID, role: 'staff', isActive: true }]);
}

async function mintToken(cardId: string, ttl: number): Promise<{ token: string; jti: string; iat: number; exp: number }> {
  const { signQrToken } = await import('../../../lib/jwt');
  return await signQrToken(cardId, ttl);
}

describe('POST /api/staff/scan', () => {
  it('happy path: increments stamp, inserts stamp_event, returns updated state', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    // 2. qrTokens select — token row, not yet used, future expiry.
    dbMock.queue.push([
      {
        jti,
        cardId: CARD_ID,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      },
    ]);
    // 3. card + customer join
    dbMock.queue.push([
      {
        id: CARD_ID,
        stampsCount: 3,
        status: 'active',
        customerName: 'Marko',
      },
    ]);
    // 4. loyaltyConfig
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    // 5. last stamp lookup — no prior stamp.
    dbMock.queue.push([]);
    // 6. atomic update of qr_tokens.usedAt with .returning() — one row consumed.
    dbMock.queue.push([{ jti }]);
    // 7. update loyalty_cards
    dbMock.queue.push(undefined);
    // 8. insert stamp_events
    dbMock.queue.push(undefined);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(jsonBody()).toEqual({
      customerName: 'Marko',
      stampsCount: 4,
      stampsRequired: 10,
      status: 'active',
      justBecameRedeemable: false,
    });
    // Verify a stamp_events insert payload was captured.
    const inserted = dbMock.insertValues.find(
      (v) => typeof v === 'object' && v !== null && 'type' in v && (v as { type: string }).type === 'stamp',
    );
    expect(inserted).toBeDefined();
    expect((inserted as { cardId: string }).cardId).toBe(CARD_ID);
    expect((inserted as { staffId: string }).staffId).toBe(STAFF_ID);
    expect((inserted as { qrJti: string }).qrJti).toBe(jti);
  });

  it('reaching stamps_required flips status to ready_to_redeem and sets justBecameRedeemable: true', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    // Card already has 9 stamps, current status active.
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 9, status: 'active', customerName: 'Ana' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]); // no last-stamp cooldown row
    dbMock.queue.push([{ jti }]); // token consumed
    dbMock.queue.push(undefined); // card update
    dbMock.queue.push(undefined); // stamp_events insert

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    expect(jsonBody()).toEqual({
      customerName: 'Ana',
      stampsCount: 10,
      stampsRequired: 10,
      status: 'ready_to_redeem',
      justBecameRedeemable: true,
    });
  });

  it('subsequent scan after redeemable state stays consistent (justBecameRedeemable=false)', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    // Card is already in ready_to_redeem with 10 stamps — test the branch
    // where status was already redeemable so justBecameRedeemable must be false.
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 10, status: 'ready_to_redeem', customerName: 'Ivan' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]); // no recent stamp (cooldown not blocking)
    dbMock.queue.push([{ jti }]);
    dbMock.queue.push(undefined);
    dbMock.queue.push(undefined);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(200);
    const body = jsonBody() as { justBecameRedeemable: boolean; status: string; stampsCount: number };
    expect(body.justBecameRedeemable).toBe(false);
    expect(body.status).toBe('ready_to_redeem');
    expect(body.stampsCount).toBe(11);
  });

  it('expired QR token → 400 token_expired', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    // Token row has expiresAt in the past — JWT signature still valid because
    // jose uses its own exp from the payload, but the DB row's expiresAt is a
    // separate guard the handler explicitly checks.
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() - 1000), usedAt: null },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(400);
    expect(jsonBody()).toEqual({ error: 'token_expired' });
  });

  it('JWT-level expiry (jose) → 400 invalid_token', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token } = await mintToken(CARD_ID, -10); // already expired per jose

    pushStaffPrincipal();

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(400);
    expect(jsonBody()).toEqual({ error: 'invalid_token' });
  });

  it('replay (qr_tokens.usedAt set) → 409 token_already_used', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      {
        jti,
        cardId: CARD_ID,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: new Date(Date.now() - 5_000),
      },
    ]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(409);
    expect(jsonBody()).toEqual({ error: 'token_already_used' });
  });

  it('cooldown active → 429 with retryAfterSeconds', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 2, status: 'active', customerName: 'Petar' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    // Last stamp 60 seconds ago — well within the 1800s cooldown.
    dbMock.queue.push([{ createdAt: new Date(Date.now() - 60_000) }]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );

    expect(statusCode()).toBe(429);
    const body = jsonBody() as { error: string; retryAfterSeconds: number };
    expect(body.error).toBe('cooldown_active');
    // ~1740s remaining (1800 - 60). Allow ±2s for clock drift between the
    // two Date.now() calls in the production code.
    expect(body.retryAfterSeconds).toBeGreaterThanOrEqual(1738);
    expect(body.retryAfterSeconds).toBeLessThanOrEqual(1741);
  });

  it('non-POST → 405 method_not_allowed', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({}, { method: 'GET' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(405);
    expect(jsonBody()).toEqual({ error: 'method_not_allowed' });
  });

  it('no staff session → 401 unauthorized', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    // No staff principal — getStaffPrincipal returns null with no cookie and
    // never queries the DB, so we don't push anything.
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: 'whatever-but-long-enough' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(401);
    expect(jsonBody()).toEqual({ error: 'unauthorized' });
  });

  it('invalid input body → 400 invalid_input', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    pushStaffPrincipal();
    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: 'short' }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(400);
    const body = jsonBody() as { error: string };
    expect(body.error).toBe('invalid_input');
  });

  it('card not found → 404', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);
    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([]); // card join returns nothing

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(404);
    expect(jsonBody()).toEqual({ error: 'card_not_found' });
  });

  it('concurrent token consumption race: returning() empty → 409 token_already_used', async () => {
    const handler = (await import('../../../api/staff/scan')).default;
    const { token, jti } = await mintToken(CARD_ID, 60);
    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 2, status: 'active', customerName: 'Race' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]); // no cooldown
    // The atomic "consume" UPDATE returns no rows because a concurrent
    // request just claimed the token first.
    dbMock.queue.push([]);

    const { res, statusCode, jsonBody } = makeRes();
    await handler(
      makeReq({ qrToken: token }, { cookie: 'gh_staff=valid' }) as unknown as Parameters<typeof handler>[0],
      res as unknown as Parameters<typeof handler>[1],
    );
    expect(statusCode()).toBe(409);
    expect(jsonBody()).toEqual({ error: 'token_already_used' });
  });
});
