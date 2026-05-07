import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { loyaltyCards, loyaltyConfig, qrTokens } from '../../../db/schema';
import { requireCustomer } from '../../../lib/auth';
import { signQrToken } from '../../../lib/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const customerId = await requireCustomer(req, res);
  if (!customerId) return;

  const cardRows = await db
    .select({ id: loyaltyCards.id })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.customerId, customerId))
    .limit(1);
  const card = cardRows[0];
  if (!card) {
    return res.status(404).json({ error: 'card_not_found' });
  }

  const configRows = await db
    .select({ qrTokenTtlSeconds: loyaltyConfig.qrTokenTtlSeconds })
    .from(loyaltyConfig)
    .where(eq(loyaltyConfig.id, 1))
    .limit(1);
  const ttlSeconds = configRows[0]?.qrTokenTtlSeconds ?? 60;

  const { token, jti, iat, exp } = await signQrToken(card.id, ttlSeconds);
  await db.insert(qrTokens).values({
    jti,
    cardId: card.id,
    expiresAt: new Date(exp * 1000),
  });

  return res.status(200).json({ token, jti, iat, exp });
}
