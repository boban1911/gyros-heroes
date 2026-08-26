import { Resend } from 'resend';

let cachedClient: Resend | null = null;
let cachedClientInitialized = false;

function getClient(): Resend | null {
  if (cachedClientInitialized) return cachedClient;
  cachedClientInitialized = true;
  const apiKey = process.env.RESEND_API_KEY;
  cachedClient = apiKey ? new Resend(apiKey) : null;
  return cachedClient;
}

const DEFAULT_FROM = 'loyalty@gyrosheroes.rs';

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
}

/** True on any Vercel deployment (production or preview), false when local. */
function isDeployed(): boolean {
  return Boolean(process.env.VERCEL ?? process.env.VERCEL_ENV);
}

/** Config snapshot for /api/health — never exposes the API key itself. */
export function emailConfigStatus(): { configured: boolean; from: string } {
  return { configured: Boolean(process.env.RESEND_API_KEY), from: fromAddress() };
}

/**
 * Why a magic-link email could not be delivered. Kept coarse and stable: the
 * codes travel to the browser, so each one maps to a distinct user-facing
 * message and a distinct fix for whoever operates the Resend account.
 */
export type EmailFailureCode =
  /** No RESEND_API_KEY in a deployed environment — nothing was even attempted. */
  | 'email_not_configured'
  /** Resend rejected the key: missing, revoked, or scoped to another domain. */
  | 'email_auth_failed'
  /** The `from` domain is not verified in the Resend account (DNS not set up). */
  | 'email_domain_unverified'
  /** Resend sandbox: an unverified account may only email its own owner. */
  | 'email_recipient_restricted'
  /** Resend refused the recipient address itself. */
  | 'email_invalid_recipient'
  /** Rate limited by Resend — a retry later is expected to work. */
  | 'email_rate_limited'
  /** Anything else, including transport/5xx failures. */
  | 'email_send_failed';

export class EmailSendError extends Error {
  readonly code: EmailFailureCode;
  /** Raw provider text. Log it; never ship it to the browser. */
  readonly providerMessage: string;
  readonly statusCode?: number;

  constructor(code: EmailFailureCode, providerMessage: string, statusCode?: number) {
    super(`${code}: ${providerMessage}`);
    this.name = 'EmailSendError';
    this.code = code;
    this.providerMessage = providerMessage;
    this.statusCode = statusCode;
  }
}

interface ResendErrorShape {
  name?: string;
  message?: string;
  statusCode?: number;
}

function classify({ name, message, statusCode }: ResendErrorShape): EmailFailureCode {
  const text = `${name ?? ''} ${message ?? ''}`.toLowerCase();

  if (text.includes('domain is not verified') || text.includes('domain_not_verified')) {
    return 'email_domain_unverified';
  }
  // Resend's sandbox guard, verbatim: "You can only send testing emails to
  // your own email address (…)". Hits every real customer, so it deserves its
  // own code rather than a generic failure.
  if (text.includes('only send testing emails')) return 'email_recipient_restricted';
  if (name === 'rate_limit_exceeded' || statusCode === 429) return 'email_rate_limited';
  if (name === 'missing_api_key' || name === 'restricted_api_key' || statusCode === 401) {
    return 'email_auth_failed';
  }
  if (text.includes('invalid `to` field') || text.includes('invalid to field')) {
    return 'email_invalid_recipient';
  }
  if (statusCode === 403) return 'email_auth_failed';
  return 'email_send_failed';
}

/** Retry only what a retry can plausibly fix: throttling and transport blips. */
function isTransient(err: EmailSendError): boolean {
  if (err.code === 'email_rate_limited') return true;
  if (err.statusCode === undefined) return true; // network/transport throw
  return err.statusCode >= 500;
}

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SendPayload = Parameters<Resend['emails']['send']>[0];

async function deliver(client: Resend, payload: SendPayload): Promise<void> {
  let failure: EmailSendError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { error } = await client.emails.send(payload);
      if (!error) return;
      const shape = error as ResendErrorShape;
      failure = new EmailSendError(
        classify(shape),
        shape.message ?? 'Resend returned an error without a message',
        shape.statusCode,
      );
    } catch (err) {
      // Thrown (not returned) means transport: DNS, TLS, timeout.
      failure = new EmailSendError('email_send_failed', (err as Error).message);
    }

    if (attempt === MAX_ATTEMPTS || !isTransient(failure)) break;
    console.warn(
      `[email] send attempt ${attempt} failed (${failure.code}: ${failure.providerMessage}) — retrying`,
    );
    await delay(RETRY_DELAY_MS);
  }

  throw failure ?? new EmailSendError('email_send_failed', 'unknown failure');
}

export type MagicLinkKind = 'register' | 'login';

export interface MagicLinkEmail {
  to: string;
  name: string;
  url: string;
  kind: MagicLinkKind;
  /** Optional Save-to-Google-Wallet URL — when present, renders a secondary CTA. */
  walletSaveUrl?: string;
}

interface MagicLinkCopy {
  subject: string;
  heading: string;
  bodyLine: string;
  textIntro: string;
  buttonLabel: string;
}

const COPY: Record<MagicLinkKind, MagicLinkCopy> = {
  register: {
    subject: 'Aktiviraj svoju Gyros Heroes karticu',
    heading: 'Zdravo {name}!',
    bodyLine: 'Klikni na dugme ispod da aktiviraš svoju Hero karticu.',
    textIntro: 'Klikni na link ispod da aktiviraš svoju Hero karticu i preuzmeš je u Google Wallet:',
    buttonLabel: 'Aktiviraj karticu',
  },
  login: {
    subject: 'Prijavi se na svoju Hero karticu',
    heading: 'Zdravo opet, {name}!',
    bodyLine: 'Klikni na dugme ispod da se prijaviš i otvoriš svoju Hero karticu.',
    textIntro: 'Klikni na link ispod da se prijaviš i otvoriš svoju Hero karticu:',
    buttonLabel: 'Otvori karticu',
  },
};

export async function sendMagicLink({
  to,
  name,
  url,
  kind,
  walletSaveUrl,
}: MagicLinkEmail): Promise<void> {
  const from = fromAddress();
  const client = getClient();
  const copy = COPY[kind];
  const subject = copy.subject;
  const heading = copy.heading.replace('{name}', name);
  const text = `Zdravo ${name},

${copy.textIntro}

${url}
${walletSaveUrl ? `\nSačuvaj karticu u Google Wallet:\n${walletSaveUrl}\n` : ''}
Link važi 24 sata. Ako nisi tražio ovaj email, slobodno ga ignoriši.

— Gyros Heroes`;

  const html = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,'Segoe UI',Inter,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F5F5">
    <tr>
      <td align="center" style="padding:24px 12px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#4866B0;padding:28px 24px">
              <span style="font-family:Montserrat,Arial,sans-serif;font-weight:900;font-size:26px;letter-spacing:-0.5px;color:#FFFFFF">GYROS</span><span style="font-family:Montserrat,Arial,sans-serif;font-weight:900;font-size:26px;letter-spacing:-0.5px;color:#FBAD18">&nbsp;HEROES</span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 32px 28px">
              <h1 style="font-family:Montserrat,Arial,sans-serif;color:#1F3B81;font-size:26px;line-height:32px;font-weight:800;margin:0 0 12px">${escapeHtml(heading)}</h1>
              <p style="font-family:-apple-system,'Segoe UI',Inter,Arial,sans-serif;font-size:16px;line-height:24px;color:#212121;margin:0 0 28px">${escapeHtml(copy.bodyLine)}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius:60px;background:#FBAD18">
                    <a href="${url}" style="display:inline-block;color:#212121;text-decoration:none;padding:16px 32px;font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:16px;border-radius:60px">${escapeHtml(copy.buttonLabel)}</a>
                  </td>
                </tr>
              </table>
              ${
                walletSaveUrl
                  ? `<p style="font-family:-apple-system,'Segoe UI',Inter,Arial,sans-serif;font-size:14px;color:#5F6470;line-height:20px;margin:28px 0 12px">Imaš Android telefon? Sačuvaj karticu odmah u Google Wallet:</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border:2px solid #1F3B81;border-radius:60px;background:#FFFFFF">
                    <a href="${walletSaveUrl}" style="display:inline-block;color:#1F3B81;text-decoration:none;padding:14px 28px;font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:15px;border-radius:60px">Sačuvaj u Google Wallet</a>
                  </td>
                </tr>
              </table>`
                  : ''
              }
              <p style="font-family:-apple-system,'Segoe UI',Inter,Arial,sans-serif;font-size:13px;color:#9596A4;line-height:20px;margin:24px 0 0">Link važi 24 sata. Ako nisi tražio ovaj email, slobodno ga ignoriši.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (!client) {
    if (isDeployed()) {
      // Silently "succeeding" here used to tell customers to check an inbox
      // that would never receive anything. Fail loudly instead.
      throw new EmailSendError(
        'email_not_configured',
        'RESEND_API_KEY is not set in this deployment',
      );
    }
    // Dev fallback: log to stdout when RESEND_API_KEY is unset locally.
    console.log('[email:dev] would send magic link to', to, 'url:', url);
    return;
  }

  await deliver(client, { from, to, subject, text, html });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
