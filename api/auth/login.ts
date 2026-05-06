import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, magicLinks } from '../../db/schema';
import { newOpaqueToken } from '../../lib/jwt';
import { sendMagicLink } from '../../lib/email';

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

const MAGIC_LINK_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { email } = parsed.data;

  const rows = await db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  const customer = rows[0];

  // Don't leak existence: always respond ok. Skip email send if no account.
  if (!customer) {
    return res.status(200).json({ ok: true });
  }

  const { token, hash } = newOpaqueToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await db.insert(magicLinks).values({
    tokenHash: hash,
    customerId: customer.id,
    expiresAt,
  });

  const baseUrl = process.env.APP_BASE_URL ?? `https://${req.headers.host}`;
  const url = `${baseUrl}/loyalty/verify?token=${token}`;

  try {
    await sendMagicLink({ to: email, name: customer.name, url, kind: 'login' });
  } catch (err) {
    return res.status(502).json({ error: 'email_send_failed', message: (err as Error).message });
  }

  return res.status(200).json({ ok: true });
}
