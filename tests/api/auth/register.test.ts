// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDb, type FakeDb } from '../../lib/fakeDb';

let dbMock: FakeDb;

const sendMagicLinkMock = vi.fn();

vi.mock('../../../db/client', () => ({
  get db() {
    return dbMock.db;
  },
  schema: {},
}));

vi.mock('../../../lib/wallet/customer', () => ({
  customerSaveUrl: vi.fn(async () => 'https://pay.google.com/gp/v/save/test'),
}));

vi.mock('../../../lib/email', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/email')>('../../../lib/email');
  return { ...actual, sendMagicLink: sendMagicLinkMock };
});

const CUSTOMER_ID = '33333333-3333-3333-3333-333333333333';

beforeEach(() => {
  dbMock = createFakeDb();
  sendMagicLinkMock.mockReset();
  sendMagicLinkMock.mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function loadApp() {
  return (await import('../../../server/app')).default;
}

/** customers upsert → loyalty_cards insert → magic_links insert. */
function queueHappyPathWrites() {
  dbMock.queue.push([{ id: CUSTOMER_ID, name: 'Petar Petrovic' }]);
  dbMock.queue.push(undefined);
  dbMock.queue.push(undefined);
}

function register() {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Petar Petrovic',
      email: 'Petar@Example.com',
      consent: true,
    }),
  };
}

describe('POST /api/auth/register', () => {
  it('returns ok when the magic link goes out', async () => {
    queueHappyPathWrites();
    const app = await loadApp();

    const res = await app.request('/api/auth/register', register());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMagicLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'petar@example.com', kind: 'register' }),
    );
  });

  it('surfaces the email failure code and hides the provider message', async () => {
    queueHappyPathWrites();
    const { EmailSendError } = await import('../../../lib/email');
    sendMagicLinkMock.mockRejectedValue(
      new EmailSendError(
        'email_domain_unverified',
        'The gyrosheroes.rs domain is not verified.',
        403,
      ),
    );
    const app = await loadApp();

    const res = await app.request('/api/auth/register', register());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'email_domain_unverified' });
    expect(JSON.stringify(body)).not.toContain('not verified');
  });

  it('answers 429 when Resend rate limits us', async () => {
    queueHappyPathWrites();
    const { EmailSendError } = await import('../../../lib/email');
    sendMagicLinkMock.mockRejectedValue(
      new EmailSendError('email_rate_limited', 'Too many requests', 429),
    );
    const app = await loadApp();

    const res = await app.request('/api/auth/register', register());

    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'email_rate_limited' });
  });

  it('falls back to email_send_failed for an unclassified throw', async () => {
    queueHappyPathWrites();
    sendMagicLinkMock.mockRejectedValue(new Error('boom'));
    const app = await loadApp();

    const res = await app.request('/api/auth/register', register());

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'email_send_failed' });
  });

  it('rejects a body without consent before touching the database', async () => {
    const app = await loadApp();

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Petar Petrovic', email: 'petar@example.com' }),
    });

    expect(res.status).toBe(400);
    expect(sendMagicLinkMock).not.toHaveBeenCalled();
  });
});
