import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards, loyaltyConfig } from '../../db/schema';
import { expirePass } from '../../lib/wallet/passLifecycle';
import { clearCustomerSession, requireCustomer, type AppVariables } from '../middleware/auth';
import { methodNotAllowed } from '../middleware/methodNotAllowed';

export const accountRoutes = new Hono<{ Variables: AppVariables }>();

const CONFIRM_PHRASE = 'OBRIŠI';

accountRoutes.get('/account/me', requireCustomer, async (c) => {
  const customerId = c.get('customerId');

  const [customerRow, cardRow, configRow] = await Promise.all([
    db.select({ id: customers.id, name: customers.name, email: customers.email })
      .from(customers).where(eq(customers.id, customerId)).limit(1),
    db.select().from(loyaltyCards).where(eq(loyaltyCards.customerId, customerId)).limit(1),
    db.select().from(loyaltyConfig).where(eq(loyaltyConfig.id, 1)).limit(1),
  ]);

  const customer = customerRow[0];
  const card = cardRow[0];
  if (!customer || !card) {
    return c.json({ error: 'card_not_found' }, 404);
  }

  const config = configRow[0] ?? { stampsRequired: 10, rewardDescription: 'Besplatan Hero gyros' };

  return c.json({
    customer,
    card: {
      id: card.id,
      stampsCount: card.stampsCount,
      totalRedemptions: card.totalRedemptions,
      status: card.status,
      stampsRequired: config.stampsRequired,
      rewardDescription: config.rewardDescription,
    },
  }, 200);
});

accountRoutes.delete('/account/delete', requireCustomer, async (c) => {
  const customerId = c.get('customerId');

  let body: { confirm?: unknown };
  try {
    body = (await c.req.json()) as { confirm?: unknown };
  } catch {
    body = {};
  }
  if (body.confirm !== CONFIRM_PHRASE) {
    return c.json({ error: 'confirmation_required' }, 400);
  }

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
      console.error('[account/delete]', err);
    }
  }

  await db.delete(customers).where(eq(customers.id, customerId));

  clearCustomerSession(c);
  return c.json({ ok: true }, 200);
});

accountRoutes.all('/account/me', methodNotAllowed(['GET']));
accountRoutes.all('/account/delete', methodNotAllowed(['DELETE']));
