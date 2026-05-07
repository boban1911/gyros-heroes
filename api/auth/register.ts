import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db } from '../../db/client';
import { customers, loyaltyCards, magicLinks } from '../../db/schema';
import { newOpaqueToken } from '../../lib/jwt';
import { sendMagicLink } from '../../lib/email';
import { customerSaveUrl } from '../../lib/wallet/customer';

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
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
  const { name, email } = parsed.data;

  // Upsert customer (return existing on conflict so re-registration just resends a link).
  const inserted = await db
    .insert(customers)
    .values({ name, email })
    .onConflictDoUpdate({ target: customers.email, set: { name } })
    .returning({ id: customers.id, name: customers.name });

  const customer = inserted[0];
  if (!customer) {
    return res.status(500).json({ error: 'customer_upsert_failed' });
  }

  // Ensure the customer has a loyalty_cards row up front so we can attach a
  // Google Wallet object to it before the email is sent. Idempotent on
  // re-registration.
  await db
    .insert(loyaltyCards)
    .values({ customerId: customer.id })
    .onConflictDoNothing({ target: loyaltyCards.customerId });

  const { token, hash } = newOpaqueToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await db.insert(magicLinks).values({
    tokenHash: hash,
    customerId: customer.id,
    expiresAt,
  });

  const baseUrl = process.env.APP_BASE_URL ?? `https://${req.headers.host}`;
  const url = `${baseUrl}/loyalty/verify?token=${token}`;

  // Best-effort: ensure a Google Wallet LoyaltyObject exists and produce a
  // Save URL for the email. If the Wallet API is unavailable, send the email
  // without the secondary CTA — auth still works.
  let walletSaveUrl: string | undefined;
  try {
    walletSaveUrl = await customerSaveUrl(customer.id);
  } catch (err) {
    console.error('[register] wallet object creation failed:', (err as Error).message);
  }

  try {
    await sendMagicLink({
      to: email,
      name: customer.name,
      url,
      kind: 'register',
      walletSaveUrl,
    });
  } catch (err) {
    return res.status(502).json({ error: 'email_send_failed', message: (err as Error).message });
  }

  return res.status(200).json({ ok: true });
}
