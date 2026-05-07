import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import {
  customers,
  loyaltyCards,
  loyaltyConfig,
  qrTokens,
  stampEvents,
} from '../../db/schema';
import { requireStaff } from '../../lib/auth';
import { verifyQrToken } from '../../lib/jwt';

const Body = z.object({
  qrToken: z.string().min(10).max(4096),
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
  const { qrToken } = parsed.data;

  // 1. Verify JWT signature + exp.
  let claims;
  try {
    claims = await verifyQrToken(qrToken);
  } catch {
    return res.status(400).json({ error: 'invalid_token' });
  }

  // 2. Look up the qr_tokens row by jti. Reject if missing or already used.
  const tokenRows = await db
    .select({
      jti: qrTokens.jti,
      cardId: qrTokens.cardId,
      expiresAt: qrTokens.expiresAt,
      usedAt: qrTokens.usedAt,
    })
    .from(qrTokens)
    .where(eq(qrTokens.jti, claims.jti))
    .limit(1);
  const tokenRow = tokenRows[0];
  if (!tokenRow) {
    return res.status(400).json({ error: 'invalid_token' });
  }
  if (tokenRow.usedAt) {
    return res.status(409).json({ error: 'token_already_used' });
  }
  if (tokenRow.expiresAt.getTime() <= Date.now()) {
    return res.status(400).json({ error: 'token_expired' });
  }
  if (tokenRow.cardId !== claims.cardId) {
    return res.status(400).json({ error: 'invalid_token' });
  }

  // 3. Read fresh card + customer + config state.
  const cardRows = await db
    .select({
      id: loyaltyCards.id,
      stampsCount: loyaltyCards.stampsCount,
      status: loyaltyCards.status,
      customerName: customers.name,
    })
    .from(loyaltyCards)
    .innerJoin(customers, eq(customers.id, loyaltyCards.customerId))
    .where(eq(loyaltyCards.id, tokenRow.cardId))
    .limit(1);
  const card = cardRows[0];
  if (!card) {
    return res.status(404).json({ error: 'card_not_found' });
  }

  const configRows = await db
    .select({
      stampsRequired: loyaltyConfig.stampsRequired,
      scanCooldownSeconds: loyaltyConfig.scanCooldownSeconds,
    })
    .from(loyaltyConfig)
    .where(eq(loyaltyConfig.id, 1))
    .limit(1);
  const config = configRows[0] ?? { stampsRequired: 10, scanCooldownSeconds: 1800 };

  // 4. Cooldown: reject if a stamp event for this card is younger than scanCooldownSeconds.
  const lastStampRows = await db
    .select({ createdAt: stampEvents.createdAt })
    .from(stampEvents)
    .where(and(eq(stampEvents.cardId, card.id), eq(stampEvents.type, 'stamp')))
    .orderBy(desc(stampEvents.createdAt))
    .limit(1);
  const lastStamp = lastStampRows[0];
  if (lastStamp) {
    const ageSeconds = (Date.now() - lastStamp.createdAt.getTime()) / 1000;
    if (ageSeconds < config.scanCooldownSeconds) {
      return res.status(429).json({
        error: 'cooldown_active',
        retryAfterSeconds: Math.ceil(config.scanCooldownSeconds - ageSeconds),
      });
    }
  }

  // 5. Atomically mark the token used. UPDATE ... WHERE used_at IS NULL guards
  // against double-scan races: the second concurrent request sees rowCount 0.
  const now = new Date();
  const consumed = await db
    .update(qrTokens)
    .set({ usedAt: now })
    .where(and(eq(qrTokens.jti, claims.jti), isNull(qrTokens.usedAt)))
    .returning({ jti: qrTokens.jti });
  if (consumed.length === 0) {
    return res.status(409).json({ error: 'token_already_used' });
  }

  // 6. Increment stamp count + flip status if reached threshold.
  const newCount = card.stampsCount + 1;
  const justBecameRedeemable =
    card.status !== 'ready_to_redeem' && newCount >= config.stampsRequired;
  const nextStatus = newCount >= config.stampsRequired ? 'ready_to_redeem' : card.status;

  await db
    .update(loyaltyCards)
    .set({ stampsCount: sql`${loyaltyCards.stampsCount} + 1`, status: nextStatus })
    .where(eq(loyaltyCards.id, card.id));

  await db.insert(stampEvents).values({
    cardId: card.id,
    type: 'stamp',
    staffId: principal.id,
    qrJti: claims.jti,
  });

  return res.status(200).json({
    customerName: card.customerName,
    stampsCount: newCount,
    stampsRequired: config.stampsRequired,
    status: nextStatus,
    justBecameRedeemable,
  });
}
