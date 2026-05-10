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

async function customerCookie(): Promise<string> {
  const token = await signSession({ sub: CUSTOMER_ID, kind: 'customer' }, 60);
  return `gh_session=${token}`;
}

async function loadApp() {
  return (await import('../../../server/app')).default;
}

describe('DELETE /api/account/delete', () => {
  it('rejects GET with 405 + Allow: DELETE', async () => {
    const app = await loadApp();
    const res = await app.request('/api/account/delete', { method: 'GET' });
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: 'method_not_allowed' });
    expect(res.headers.get('Allow')).toBe('DELETE');
  });

  it('rejects POST with 405 + Allow: DELETE', async () => {
    const app = await loadApp();
    const res = await app.request('/api/account/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'OBRIŠI' }),
    });
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('DELETE');
  });

  it('returns 401 when no session cookie', async () => {
    const app = await loadApp();
    const res = await app.request('/api/account/delete', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'OBRIŠI' }),
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('returns 400 confirmation_required when body lacks the magic word', async () => {
    const app = await loadApp();
    const cookie = await customerCookie();
    const res = await app.request('/api/account/delete', {
      method: 'DELETE',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'delete' }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'confirmation_required' });
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('returns 400 when body is empty', async () => {
    const app = await loadApp();
    const cookie = await customerCookie();
    const res = await app.request('/api/account/delete', {
      method: 'DELETE',
      headers: { cookie },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'confirmation_required' });
    expect(dbMock.deleteSpy).not.toHaveBeenCalled();
  });

  it('happy path: expires wallet pass, deletes customer, clears cookie, returns ok', async () => {
    const app = await loadApp();
    const cookie = await customerCookie();
    dbMock.queue.push([{ googleObjectId: 'issuer.obj-happy' }]);
    dbMock.queue.push(undefined);

    const res = await app.request('/api/account/delete', {
      method: 'DELETE',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'OBRIŠI' }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(expirePassMock).toHaveBeenCalledTimes(1);
    expect(expirePassMock).toHaveBeenCalledWith('issuer.obj-happy');
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);

    const setCookie = res.headers.get('Set-Cookie');
    expect(setCookie).toMatch(/^gh_session=;/);
    expect(setCookie).toMatch(/Max-Age=0/);
    expect(setCookie).toMatch(/Path=\//);
    expect(setCookie).toMatch(/SameSite=Lax/);
  });

  it('skips wallet expire when customer has no saved Google Wallet pass', async () => {
    const app = await loadApp();
    const cookie = await customerCookie();
    dbMock.queue.push([{ googleObjectId: null }]);
    dbMock.queue.push(undefined);

    const res = await app.request('/api/account/delete', {
      method: 'DELETE',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'OBRIŠI' }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(expirePassMock).not.toHaveBeenCalled();
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('still completes deletion when expirePass rejects', async () => {
    const app = await loadApp();
    const cookie = await customerCookie();
    dbMock.queue.push([{ googleObjectId: 'issuer.obj-broken' }]);
    dbMock.queue.push(undefined);
    expirePassMock.mockRejectedValueOnce(new Error('wallet down'));

    const res = await app.request('/api/account/delete', {
      method: 'DELETE',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: 'OBRIŠI' }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(dbMock.deleteSpy).toHaveBeenCalledTimes(1);
    expect(res.headers.get('Set-Cookie')).toMatch(/^gh_session=;/);
  });
});
