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

export interface MagicLinkEmail {
  to: string;
  name: string;
  url: string;
}

export async function sendMagicLink({ to, name, url }: MagicLinkEmail): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? 'loyalty@gyrosheroes.rs';
  const client = getClient();
  const subject = 'Aktiviraj svoju Gyros Heroes karticu';
  const text = `Zdravo ${name},

Klikni na link ispod da aktiviraš svoju Hero karticu i preuzmeš je u Google Wallet:

${url}

Link važi 24 sata. Ako nisi tražio ovaj email, slobodno ga ignoriši.

— Gyros Heroes`;

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#212121">
      <h1 style="font-family:Montserrat,sans-serif;color:#1F3B81;font-size:24px;margin:0 0 16px">Zdravo ${escapeHtml(name)}!</h1>
      <p style="font-size:16px;line-height:24px;margin:0 0 24px">Klikni na dugme ispod da aktiviraš svoju Hero karticu.</p>
      <p style="margin:0 0 24px">
        <a href="${url}" style="display:inline-block;background:#FBAD18;color:#212121;text-decoration:none;padding:14px 28px;border-radius:60px;font-weight:600">Aktiviraj karticu</a>
      </p>
      <p style="font-size:14px;color:#9596A4;line-height:20px;margin:0 0 8px">Link važi 24 sata.</p>
      <p style="font-size:14px;color:#9596A4;line-height:20px;margin:0">Ako nisi tražio ovaj email, slobodno ga ignoriši.</p>
    </div>
  `;

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
