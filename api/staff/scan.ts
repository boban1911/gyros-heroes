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
import { verify as verifyTotp } from '../../lib/totp';
import { applyReadyToRedeemVisual } from '../../lib/wallet/passVisual';

const TOTP_PATTERN = /^gh:card:([0-9a-f-]{36}):(\d{6})$/;

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

  // 1. Detect input format. JWTs are compact-serialized base64url and start with
  // "eyJ"; the rotating-barcode payload uses the self-identifying
  // `gh:card:<uuid>:<6-digit-totp>` format. Anything else → reject.
  let claims: { jti: string; cardId: string } | null = null;
  let totpCardId: string | null = null;
  let totpCode: string | null = null;
  if (qrToken.startsWith('eyJ')) {
    try {
      claims = await verifyQrToken(qrToken);
    } catch {
      return res.status(400).json({ error: 'invalid_token' });
    }
  } else {
    const m = qrToken.match(TOTP_PATTERN);
    if (!m) {
      return res.status(400).json({ error: 'invalid_token' });
    }
    totpCardId = m[1];
    totpCode = m[2];
  }

  // 2. JWT path: look up the qr_tokens row by jti. TOTP path skips this entirely.
  let tokenRow: { jti: string; cardId: string; expiresAt: Date; usedAt: Date | null } | null = null;
  if (claims) {
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
    tokenRow = tokenRows[0] ?? null;
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
  }

  // 3. Read fresh card + customer + config state. JWT path resolves cardId via
  // the qr_tokens row; TOTP path uses the cardId embedded in the payload.
  const lookupCardId = tokenRow ? tokenRow.cardId : (totpCardId as string);
  const cardRows = await db
    .select({
      id: loyaltyCards.id,
      stampsCount: loyaltyCards.stampsCount,
      status: loyaltyCards.status,
      totpSecret: loyaltyCards.totpSecret,
      googleObjectId: loyaltyCards.googleObjectId,
      customerName: customers.name,
    })
    .from(loyaltyCards)
    .innerJoin(customers, eq(customers.id, loyaltyCards.customerId))
    .where(eq(loyaltyCards.id, lookupCardId))
    .limit(1);
  const card = cardRows[0];
  if (!card) {
    return res.status(404).json({ error: 'card_not_found' });
  }

  // For the TOTP path we now have the secret — verify the rotating code.
  // Replay protection inside the 30s window is handled by the scan cooldown
  // below (typically 30 minutes), which dwarfs the TOTP rotation period.
  if (totpCode) {
    if (!card.totpSecret || !verifyTotp(card.totpSecret, totpCode)) {
      return res.status(400).json({ error: 'invalid_token' });
    }
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

  // Card is already at the threshold — staff should redeem, not stamp again.
  // Don't consume the JWT here so the customer's freshly-minted token can still
  // be used by the redeem flow if we ever wire it that way.
  if (card.status === 'ready_to_redeem') {
    return res.status(200).json({
      action: 'awaiting_redeem',
      cardId: card.id,
      customerName: card.customerName,
      stampsCount: card.stampsCount,
      stampsRequired: config.stampsRequired,
      status: 'ready_to_redeem' as const,
    });
  }

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

  // 5. JWT path only: atomically mark the token used. UPDATE ... WHERE used_at
  // IS NULL guards against double-scan races. TOTP relies on the cooldown above.
  if (claims) {
    const now = new Date();
    const consumed = await db
      .update(qrTokens)
      .set({ usedAt: now })
      .where(and(eq(qrTokens.jti, claims.jti), isNull(qrTokens.usedAt)))
      .returning({ jti: qrTokens.jti });
    if (consumed.length === 0) {
      return res.status(409).json({ error: 'token_already_used' });
    }
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
    qrJti: claims ? claims.jti : null,
  });

  // Best-effort: flip the customer's Google Wallet pass to the celebratory
  // visual when they crossed the threshold. Skip silently if they haven't
  // saved the pass yet (googleObjectId is null) or if the Wallet API errors.
  if (justBecameRedeemable && card.googleObjectId) {
    await applyReadyToRedeemVisual(card.googleObjectId);
  }

  return res.status(200).json({
    action: 'stamped' as const,
    cardId: card.id,
    customerName: card.customerName,
    stampsCount: newCount,
    stampsRequired: config.stampsRequired,
    status: nextStatus,
    justBecameRedeemable,
  });
}
