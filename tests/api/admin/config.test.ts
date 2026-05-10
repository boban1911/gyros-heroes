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

const ADMIN_ID = '00000000-0000-0000-0000-0000000000a1';

function pushAdminPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'admin', isActive: true }]);
}

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'staff', isActive: true }]);
}

async function loadApp() {
  return (await import('../../../server/app')).default;
}

describe('GET /api/admin/config', () => {
  it('returns the loyalty config row for admin', async () => {
    const app = await loadApp();
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

    const res = await app.request('/api/admin/config', {
      method: 'GET',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { stampsRequired: number; rewardDescription: string };
    expect(body.stampsRequired).toBe(10);
    expect(body.rewardDescription).toBe('Besplatan Hero gyros');
  });

  it('no cookie → 401', async () => {
    const app = await loadApp();
    const res = await app.request('/api/admin/config', { method: 'GET' });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('non-admin staff → 403', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    const res = await app.request('/api/admin/config', {
      method: 'GET',
      headers: { cookie: 'gh_staff=valid' },
    });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden' });
  });

  it('disallowed method → 405', async () => {
    const app = await loadApp();
    const res = await app.request('/api/admin/config', { method: 'DELETE' });
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'method_not_allowed' });
  });
});

describe('PUT /api/admin/config', () => {
  it('updates and returns the row', async () => {
    const app = await loadApp();
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

    const res = await app.request('/api/admin/config', {
      method: 'PUT',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({
        stampsRequired: 8,
        rewardDescription: 'Free wrap',
        scanCooldownSeconds: 600,
        qrTokenTtlSeconds: 90,
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { stampsRequired: number; rewardDescription: string };
    expect(body.stampsRequired).toBe(8);
    expect(body.rewardDescription).toBe('Free wrap');
    const setPayload = dbMock.updateSets[0] as { stampsRequired: number };
    expect(setPayload.stampsRequired).toBe(8);
  });

  it('rejects empty rewardDescription', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    const res = await app.request('/api/admin/config', {
      method: 'PUT',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({
        stampsRequired: 10,
        rewardDescription: '   ',
        scanCooldownSeconds: 1800,
        qrTokenTtlSeconds: 60,
      }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_input');
  });

  it('rejects out-of-range numbers', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    const res = await app.request('/api/admin/config', {
      method: 'PUT',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({
        stampsRequired: 0,
        rewardDescription: 'ok',
        scanCooldownSeconds: 1800,
        qrTokenTtlSeconds: 60,
      }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_input');
  });

  it('non-admin → 403', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    const res = await app.request('/api/admin/config', {
      method: 'PUT',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({
        stampsRequired: 10,
        rewardDescription: 'ok',
        scanCooldownSeconds: 1800,
        qrTokenTtlSeconds: 60,
      }),
    });
    expect(res.status).toBe(403);
  });
});
