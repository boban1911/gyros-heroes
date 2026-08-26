// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

/** Fresh module per test — the Resend client is cached at module scope. */
async function loadEmail() {
  vi.resetModules();
  return import('../../lib/email');
}

const MAGIC_LINK = {
  to: 'petar@example.com',
  name: 'Petar Petrovic',
  url: 'https://gyrosheroes.rs/loyalty/verify?token=abc',
  kind: 'register' as const,
};

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.RESEND_FROM_EMAIL = 'loyalty@gyrosheroes.rs';
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('sendMagicLink', () => {
  it('resolves when Resend accepts the message', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
    const { sendMagicLink } = await loadEmail();

    await expect(sendMagicLink(MAGIC_LINK)).resolves.toBeUndefined();

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toMatchObject({
      from: 'loyalty@gyrosheroes.rs',
      to: 'petar@example.com',
    });
  });

  it('classifies an unverified sending domain', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: 'validation_error',
        statusCode: 403,
        message: 'The gyrosheroes.rs domain is not verified. Please add and verify your domain.',
      },
    });
    const { sendMagicLink, EmailSendError } = await loadEmail();

    const err = await sendMagicLink(MAGIC_LINK).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(EmailSendError);
    expect((err as InstanceType<typeof EmailSendError>).code).toBe('email_domain_unverified');
    expect(sendMock).toHaveBeenCalledTimes(1); // not transient — no retry
  });

  it("classifies Resend's sandbox recipient restriction", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: {
        name: 'validation_error',
        statusCode: 403,
        message: 'You can only send testing emails to your own email address (owner@example.com).',
      },
    });
    const { sendMagicLink, EmailSendError } = await loadEmail();

    const err = (await sendMagicLink(MAGIC_LINK).catch((e: unknown) => e)) as InstanceType<
      typeof EmailSendError
    >;

    expect(err.code).toBe('email_recipient_restricted');
    expect(err.providerMessage).toContain('own email address');
  });

  it('classifies an invalid API key', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: 'missing_api_key', statusCode: 401, message: 'API key is invalid' },
    });
    const { sendMagicLink, EmailSendError } = await loadEmail();

    const err = (await sendMagicLink(MAGIC_LINK).catch((e: unknown) => e)) as InstanceType<
      typeof EmailSendError
    >;

    expect(err.code).toBe('email_auth_failed');
  });

  it('retries once on rate limiting and succeeds', async () => {
    sendMock
      .mockResolvedValueOnce({
        data: null,
        error: { name: 'rate_limit_exceeded', statusCode: 429, message: 'Too many requests' },
      })
      .mockResolvedValueOnce({ data: { id: 'msg_2' }, error: null });
    const { sendMagicLink } = await loadEmail();

    await expect(sendMagicLink(MAGIC_LINK)).resolves.toBeUndefined();
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('gives up with email_rate_limited when the retry also fails', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', statusCode: 429, message: 'Too many requests' },
    });
    const { sendMagicLink, EmailSendError } = await loadEmail();

    const err = (await sendMagicLink(MAGIC_LINK).catch((e: unknown) => e)) as InstanceType<
      typeof EmailSendError
    >;

    expect(err.code).toBe('email_rate_limited');
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('retries a transport-level throw', async () => {
    sendMock
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValueOnce({ data: { id: 'msg_3' }, error: null });
    const { sendMagicLink } = await loadEmail();

    await expect(sendMagicLink(MAGIC_LINK)).resolves.toBeUndefined();
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('logs instead of sending when no API key is set locally', async () => {
    delete process.env.RESEND_API_KEY;
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { sendMagicLink } = await loadEmail();

    await expect(sendMagicLink(MAGIC_LINK)).resolves.toBeUndefined();

    expect(sendMock).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalled();
  });

  it('fails loudly when no API key is set on a deployment', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.VERCEL = '1';
    const { sendMagicLink, EmailSendError } = await loadEmail();

    const err = (await sendMagicLink(MAGIC_LINK).catch((e: unknown) => e)) as InstanceType<
      typeof EmailSendError
    >;

    expect(err).toBeInstanceOf(EmailSendError);
    expect(err.code).toBe('email_not_configured');
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe('emailConfigStatus', () => {
  it('reports the from address without leaking the key', async () => {
    const { emailConfigStatus } = await loadEmail();
    expect(emailConfigStatus()).toEqual({ configured: true, from: 'loyalty@gyrosheroes.rs' });
    expect(JSON.stringify(emailConfigStatus())).not.toContain('re_test_key');
  });

  it('reports a missing key', async () => {
    delete process.env.RESEND_API_KEY;
    const { emailConfigStatus } = await loadEmail();
    expect(emailConfigStatus().configured).toBe(false);
  });
});
