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

const applyReadyToRedeemVisualMock = vi.fn(async () => {});
const applyActiveVisualMock = vi.fn(async () => {});
vi.mock('../../../lib/wallet/passVisual', () => ({
  applyReadyToRedeemVisual: applyReadyToRedeemVisualMock,
  applyActiveVisual: applyActiveVisualMock,
}));

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

beforeEach(() => {
  dbMock = createFakeDb();
  applyReadyToRedeemVisualMock.mockClear();
  applyActiveVisualMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

const STAFF_ID = '00000000-0000-0000-0000-000000000001';
const CARD_ID = '00000000-0000-0000-0000-0000000000aa';

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: STAFF_ID, role: 'staff', isActive: true }]);
}

async function mintToken(cardId: string, ttl: number): Promise<{ token: string; jti: string; iat: number; exp: number }> {
  const { signQrToken } = await import('../../../lib/jwt');
  return await signQrToken(cardId, ttl);
}

async function loadApp() {
  return (await import('../../../server/app')).default;
}

async function postScan(qrToken: string, cookie?: string): Promise<Response> {
  const app = await loadApp();
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  return await app.request('/api/staff/scan', {
    method: 'POST',
    headers,
    body: JSON.stringify({ qrToken }),
  });
}

describe('POST /api/staff/scan', () => {
  it('happy path: increments stamp, inserts stamp_event, returns updated state', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 3, status: 'active', googleObjectId: 'iss.card_abc', customerName: 'Marko' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]);
    dbMock.queue.push([{ jti }]);
    dbMock.queue.push(undefined);
    dbMock.queue.push(undefined);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      action: 'stamped',
      cardId: CARD_ID,
      customerName: 'Marko',
      stampsCount: 4,
      stampsRequired: 10,
      status: 'active',
      justBecameRedeemable: false,
    });
    const inserted = dbMock.insertValues.find(
      (v) => typeof v === 'object' && v !== null && 'type' in v && (v as { type: string }).type === 'stamp',
    );
    expect(inserted).toBeDefined();
    expect((inserted as { cardId: string }).cardId).toBe(CARD_ID);
    expect((inserted as { staffId: string }).staffId).toBe(STAFF_ID);
    expect((inserted as { qrJti: string }).qrJti).toBe(jti);
    expect(applyReadyToRedeemVisualMock).not.toHaveBeenCalled();
  });

  it('reaching stamps_required flips status to ready_to_redeem and sets justBecameRedeemable: true', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 9, status: 'active', googleObjectId: 'iss.card_ana', customerName: 'Ana' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]);
    dbMock.queue.push([{ jti }]);
    dbMock.queue.push(undefined);
    dbMock.queue.push(undefined);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      action: 'stamped',
      cardId: CARD_ID,
      customerName: 'Ana',
      stampsCount: 10,
      stampsRequired: 10,
      status: 'ready_to_redeem',
      justBecameRedeemable: true,
    });
    expect(applyReadyToRedeemVisualMock).toHaveBeenCalledTimes(1);
    expect(applyReadyToRedeemVisualMock).toHaveBeenCalledWith('iss.card_ana');
  });

  it('threshold flip with no saved wallet pass (googleObjectId null) skips the visual call', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 9, status: 'active', googleObjectId: null, customerName: 'NoWallet' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]);
    dbMock.queue.push([{ jti }]);
    dbMock.queue.push(undefined);
    dbMock.queue.push(undefined);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(200);
    expect(applyReadyToRedeemVisualMock).not.toHaveBeenCalled();
  });

  it('scanning a card already in ready_to_redeem returns awaiting_redeem without consuming token or stamping', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 10, status: 'ready_to_redeem', googleObjectId: 'iss.card_ivan', customerName: 'Ivan' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      action: 'awaiting_redeem',
      cardId: CARD_ID,
      customerName: 'Ivan',
      stampsCount: 10,
      stampsRequired: 10,
      status: 'ready_to_redeem',
    });
    expect(
      dbMock.insertValues.some(
        (v) => typeof v === 'object' && v !== null && 'type' in v && (v as { type: string }).type === 'stamp',
      ),
    ).toBe(false);
  });

  it('expired QR token → 400 token_expired', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() - 1000), usedAt: null },
    ]);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'token_expired' });
  });

  it('JWT-level expiry (jose) → 400 invalid_token', async () => {
    const { token } = await mintToken(CARD_ID, -10);
    pushStaffPrincipal();

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_token' });
  });

  it('replay (qr_tokens.usedAt set) → 409 token_already_used', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: new Date(Date.now() - 5_000) },
    ]);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'token_already_used' });
  });

  it('cooldown active → 429 with retryAfterSeconds', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);

    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 2, status: 'active', googleObjectId: null, customerName: 'Petar' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([{ createdAt: new Date(Date.now() - 60_000) }]);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(429);
    const body = (await res.json()) as { error: string; retryAfterSeconds: number };
    expect(body.error).toBe('cooldown_active');
    expect(body.retryAfterSeconds).toBeGreaterThanOrEqual(1738);
    expect(body.retryAfterSeconds).toBeLessThanOrEqual(1741);
  });

  it('non-POST → 405 method_not_allowed', async () => {
    const app = await loadApp();
    const res = await app.request('/api/staff/scan', { method: 'GET' });
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'method_not_allowed' });
  });

  it('no staff session → 401 unauthorized', async () => {
    const res = await postScan('whatever-but-long-enough');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('invalid input body → 400 invalid_input', async () => {
    pushStaffPrincipal();
    const res = await postScan('short', 'gh_staff=valid');
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_input');
  });

  it('card not found → 404', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);
    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([]);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'card_not_found' });
  });

  describe('TOTP rotating-barcode path', () => {
    const TOTP_SECRET_B32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

    async function currentCode(): Promise<string> {
      const { generate } = await import('../../../lib/totp');
      return generate(TOTP_SECRET_B32);
    }

    it('happy path: valid TOTP increments stamp, no qr_tokens row consumed', async () => {
      const code = await currentCode();
      const payload = `gh:card:${CARD_ID}:${code}`;

      pushStaffPrincipal();
      dbMock.queue.push([
        { id: CARD_ID, stampsCount: 4, status: 'active', totpSecret: TOTP_SECRET_B32, googleObjectId: null, customerName: 'Mila' },
      ]);
      dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
      dbMock.queue.push([]);
      dbMock.queue.push(undefined);
      dbMock.queue.push(undefined);

      const res = await postScan(payload, 'gh_staff=valid');
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        action: 'stamped',
        cardId: CARD_ID,
        customerName: 'Mila',
        stampsCount: 5,
        stampsRequired: 10,
        status: 'active',
        justBecameRedeemable: false,
      });
      const inserted = dbMock.insertValues.find(
        (v) => typeof v === 'object' && v !== null && 'type' in v && (v as { type: string }).type === 'stamp',
      ) as { qrJti: string | null } | undefined;
      expect(inserted).toBeDefined();
      expect(inserted?.qrJti).toBeNull();
    });

    it('wrong TOTP code → 400 invalid_token', async () => {
      const payload = `gh:card:${CARD_ID}:000000`;

      pushStaffPrincipal();
      dbMock.queue.push([
        { id: CARD_ID, stampsCount: 1, status: 'active', totpSecret: TOTP_SECRET_B32, googleObjectId: null, customerName: 'Wrong' },
      ]);

      const res = await postScan(payload, 'gh_staff=valid');
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_token' });
    });

    it('unknown card id → 404 card_not_found', async () => {
      const code = await currentCode();
      const payload = `gh:card:${CARD_ID}:${code}`;

      pushStaffPrincipal();
      dbMock.queue.push([]);

      const res = await postScan(payload, 'gh_staff=valid');
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'card_not_found' });
    });

    it('cooldown active on TOTP path → 429', async () => {
      const code = await currentCode();
      const payload = `gh:card:${CARD_ID}:${code}`;

      pushStaffPrincipal();
      dbMock.queue.push([
        { id: CARD_ID, stampsCount: 2, status: 'active', totpSecret: TOTP_SECRET_B32, googleObjectId: null, customerName: 'Cool' },
      ]);
      dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
      dbMock.queue.push([{ createdAt: new Date(Date.now() - 60_000) }]);

      const res = await postScan(payload, 'gh_staff=valid');
      expect(res.status).toBe(429);
      const body = (await res.json()) as { error: string; retryAfterSeconds: number };
      expect(body.error).toBe('cooldown_active');
      expect(body.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('malformed payload (not JWT, not TOTP) → 400 invalid_token', async () => {
      pushStaffPrincipal();

      const res = await postScan('not-a-jwt-or-totp-payload', 'gh_staff=valid');
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_token' });
    });
  });

  it('concurrent token consumption race: returning() empty → 409 token_already_used', async () => {
    const { token, jti } = await mintToken(CARD_ID, 60);
    pushStaffPrincipal();
    dbMock.queue.push([
      { jti, cardId: CARD_ID, expiresAt: new Date(Date.now() + 60_000), usedAt: null },
    ]);
    dbMock.queue.push([
      { id: CARD_ID, stampsCount: 2, status: 'active', googleObjectId: null, customerName: 'Race' },
    ]);
    dbMock.queue.push([{ stampsRequired: 10, scanCooldownSeconds: 1800 }]);
    dbMock.queue.push([]);
    dbMock.queue.push([]);

    const res = await postScan(token, 'gh_staff=valid');
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'token_already_used' });
  });
});
