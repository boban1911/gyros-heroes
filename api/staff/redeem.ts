import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { customers, loyaltyCards, stampEvents } from '../../db/schema';
import { requireStaff } from '../../lib/auth';
import { applyActiveVisual } from '../../lib/wallet/passVisual';

const Body = z.object({
  cardId: z.string().uuid(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const principal = await requireStaff(req, res);
  if (!principal) return;

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { cardId } = parsed.data;

  // Atomic flip: only redeem if the card is still ready_to_redeem. Two concurrent
  // redeem requests can race; the second sees rowCount 0 and returns 409.
  const flipped = await db
    .update(loyaltyCards)
    .set({
      stampsCount: 0,
      status: 'active',
      totalRedemptions: sql`${loyaltyCards.totalRedemptions} + 1`,
    })
    .where(and(eq(loyaltyCards.id, cardId), eq(loyaltyCards.status, 'ready_to_redeem')))
    .returning({
      id: loyaltyCards.id,
      customerId: loyaltyCards.customerId,
      googleObjectId: loyaltyCards.googleObjectId,
    });

  if (flipped.length === 0) {
    const existing = await db
      .select({ id: loyaltyCards.id })
      .from(loyaltyCards)
      .where(eq(loyaltyCards.id, cardId))
      .limit(1);
    if (existing.length === 0) return res.status(404).json({ error: 'card_not_found' });
    return res.status(409).json({ error: 'not_ready_to_redeem' });
  }

  await db.insert(stampEvents).values({
    cardId,
    type: 'redeem',
    staffId: principal.id,
  });

  // Best-effort: revert the customer's Google Wallet pass to the default
  // visual. Skip silently if they haven't saved the pass yet.
  if (flipped[0].googleObjectId) {
    await applyActiveVisual(flipped[0].googleObjectId);
  }

  const customerRows = await db
    .select({ name: customers.name })
    .from(customers)
    .where(eq(customers.id, flipped[0].customerId))
    .limit(1);

  return res.status(200).json({
    ok: true,
    cardId,
    customerName: customerRows[0]?.name ?? '',
  });
}
