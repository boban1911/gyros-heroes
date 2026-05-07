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
  const from = process.env.RESEND_FROM_EMAIL ?? 'loyalty@gyrosheroes.rs';
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
    // Dev fallback: log to stdout when RESEND_API_KEY is unset.
    console.log('[email:dev] would send magic link to', to, 'url:', url);
    return;
  }

  const { error } = await client.emails.send({ from, to, subject, text, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
