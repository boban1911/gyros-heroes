import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards } from '../../db/schema';
import { clearCustomerSession, requireCustomer } from '../../lib/auth';
import { expirePass } from '../../lib/wallet/passLifecycle';

const CONFIRM_PHRASE = 'OBRIŠI';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const customerId = await requireCustomer(req, res);
  if (!customerId) return; // requireCustomer already responded.

  const body = (req.body ?? {}) as { confirm?: unknown };
  if (body.confirm !== CONFIRM_PHRASE) {
    return res.status(400).json({ error: 'confirmation_required' });
  }

  // Best-effort: mark the customer's Google Wallet pass as EXPIRED before
  // we drop the row — once the DB delete cascades through loyalty_cards we
  // lose the googleObjectId we'd need to address the wallet object. Any
  // wallet-side failure is swallowed by `expirePass`.
  const cardRows = await db
    .select({ googleObjectId: loyaltyCards.googleObjectId })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.customerId, customerId))
    .limit(1);
  const googleObjectId = cardRows[0]?.googleObjectId ?? null;
  if (googleObjectId) {
    try {
      await expirePass(googleObjectId);
    } catch (err) {
      // `expirePass` swallows by contract; this is belt-and-suspenders so a
      // wallet hiccup can never block a GDPR account deletion.
      console.error('[account/delete]', err);
    }
  }

  // FK cascades wipe magic_links, loyalty_cards, stamp_events, qr_tokens.
  await db.delete(customers).where(eq(customers.id, customerId));

  clearCustomerSession(res);
  return res.status(200).json({ ok: true });
}
