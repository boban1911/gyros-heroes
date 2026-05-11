import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { loyaltyCards, loyaltyConfig, qrTokens } from '../../db/schema.js';
import { signQrToken } from '../../lib/jwt.js';
import { customerSaveUrl } from '../../lib/wallet/customer.js';
import { requireCustomer, type AppVariables } from '../middleware/auth.js';
import { methodNotAllowed } from '../middleware/methodNotAllowed.js';

export const walletRoutes = new Hono<{ Variables: AppVariables }>();

walletRoutes.get('/wallet/google/qr-token', requireCustomer, async (c) => {
  const customerId = c.get('customerId');

  const cardRows = await db
    .select({ id: loyaltyCards.id })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.customerId, customerId))
    .limit(1);
  const card = cardRows[0];
  if (!card) {
    return c.json({ error: 'card_not_found' }, 404);
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

  return c.json({ token, jti, iat, exp }, 200);
});

walletRoutes.get('/wallet/google/save-url', requireCustomer, async (c) => {
  const customerId = c.get('customerId');
  try {
    const url = await customerSaveUrl(customerId);
    return c.json({ url }, 200);
  } catch (err) {
    console.error('[wallet/save-url] failed:', (err as Error).message);
    return c.json(
      { error: 'wallet_unavailable', message: (err as Error).message },
      502,
    );
  }
});

walletRoutes.all('/wallet/google/qr-token', methodNotAllowed(['GET']));
walletRoutes.all('/wallet/google/save-url', methodNotAllowed(['GET']));
