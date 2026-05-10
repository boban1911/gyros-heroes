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

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';

function pushAdminPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'admin', isActive: true }]);
}

function pushStaffPrincipal(): void {
  dbMock.queue.push([{ staffId: ADMIN_ID, role: 'staff', isActive: true }]);
}

async function loadApp() {
  return (await import('../../../server/app')).default;
}

describe('GET /api/admin/staff', () => {
  it('returns list ordered by createdAt desc, no passwordHash', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: ADMIN_ID,
        email: 'admin@gh.rs',
        name: 'Admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        id: OTHER_ID,
        email: 'staff@gh.rs',
        name: 'Staff',
        role: 'staff',
        isActive: true,
        createdAt: new Date('2026-04-20T10:00:00Z'),
      },
    ]);

    const res = await app.request('/api/admin/staff', {
      method: 'GET',
      headers: { cookie: 'gh_staff=valid' },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { staff: Array<Record<string, unknown>> };
    expect(body.staff).toHaveLength(2);
    expect(body.staff[0]).not.toHaveProperty('passwordHash');
    expect(body.staff[0].email).toBe('admin@gh.rs');
  });

  it('no cookie → 401', async () => {
    const app = await loadApp();
    const res = await app.request('/api/admin/staff', { method: 'GET' });
    expect(res.status).toBe(401);
  });

  it('non-admin → 403', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    const res = await app.request('/api/admin/staff', {
      method: 'GET',
      headers: { cookie: 'gh_staff=valid' },
    });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/admin/staff', () => {
  it('creates new staff and returns row without passwordHash', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([]);
    dbMock.queue.push([
      {
        id: OTHER_ID,
        email: 'new@gh.rs',
        name: 'Nova',
        role: 'staff',
        isActive: true,
        createdAt: new Date('2026-05-08T11:00:00Z'),
      },
    ]);

    const res = await app.request('/api/admin/staff', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'new@gh.rs', name: 'Nova', password: 'secret-pass-123', role: 'staff' }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty('passwordHash');
    expect(body.email).toBe('new@gh.rs');
    const inserted = dbMock.insertValues[0] as { email: string; passwordHash: string };
    expect(inserted.email).toBe('new@gh.rs');
    expect(typeof inserted.passwordHash).toBe('string');
    expect(inserted.passwordHash.length).toBeGreaterThan(20);
  });

  it('duplicate email → 409', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([{ id: OTHER_ID }]);

    const res = await app.request('/api/admin/staff', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'dup@gh.rs', name: 'Dup', password: 'secret-pass-123', role: 'staff' }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'email_already_exists' });
  });

  it('rejects invalid role/short password', async () => {
    const app = await loadApp();
    pushAdminPrincipal();

    const res = await app.request('/api/admin/staff', {
      method: 'POST',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'x@gh.rs', name: 'X', password: 'short', role: 'staff' }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('invalid_input');
  });
});

describe('PATCH /api/admin/staff', () => {
  it('toggles isActive on another user', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: OTHER_ID,
        email: 's@gh.rs',
        name: 'S',
        role: 'staff',
        isActive: false,
        createdAt: new Date('2026-04-01T10:00:00Z'),
      },
    ]);

    const res = await app.request('/api/admin/staff', {
      method: 'PATCH',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ id: OTHER_ID, isActive: false }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.isActive).toBe(false);
    expect(body).not.toHaveProperty('passwordHash');
  });

  it('refuses self-deactivation', async () => {
    const app = await loadApp();
    pushAdminPrincipal();

    const res = await app.request('/api/admin/staff', {
      method: 'PATCH',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ id: ADMIN_ID, isActive: false }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'cannot_deactivate_self' });
  });

  it('allows reactivating self', async () => {
    const app = await loadApp();
    pushAdminPrincipal();
    dbMock.queue.push([
      {
        id: ADMIN_ID,
        email: 'admin@gh.rs',
        name: 'Admin',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2026-04-01T10:00:00Z'),
      },
    ]);

    const res = await app.request('/api/admin/staff', {
      method: 'PATCH',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ id: ADMIN_ID, isActive: true }),
    });

    expect(res.status).toBe(200);
  });

  it('staff (non-admin) → 403', async () => {
    const app = await loadApp();
    pushStaffPrincipal();
    const res = await app.request('/api/admin/staff', {
      method: 'PATCH',
      headers: { cookie: 'gh_staff=valid', 'content-type': 'application/json' },
      body: JSON.stringify({ id: OTHER_ID, isActive: false }),
    });
    expect(res.status).toBe(403);
  });
});

describe('method handling', () => {
  it('unsupported method → 405', async () => {
    const app = await loadApp();
    const res = await app.request('/api/admin/staff', { method: 'DELETE' });
    expect(res.status).toBe(405);
  });
});
