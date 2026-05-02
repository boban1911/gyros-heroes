import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards, loyaltyConfig } from '../../db/schema';
import { requireCustomer } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const customerId = await requireCustomer(req, res);
  if (!customerId) return; // requireCustomer already responded.

  const [customerRow, cardRow, configRow] = await Promise.all([
    db.select({ id: customers.id, name: customers.name, email: customers.email })
      .from(customers).where(eq(customers.id, customerId)).limit(1),
    db.select().from(loyaltyCards).where(eq(loyaltyCards.customerId, customerId)).limit(1),
    db.select().from(loyaltyConfig).where(eq(loyaltyConfig.id, 1)).limit(1),
  ]);

  const customer = customerRow[0];
  const card = cardRow[0];
  if (!customer || !card) {
    return res.status(404).json({ error: 'card_not_found' });
  }

  const config = configRow[0] ?? { stampsRequired: 10, rewardDescription: 'Besplatan Hero gyros' };

  return res.status(200).json({
    customer,
    card: {
      id: card.id,
      stampsCount: card.stampsCount,
      totalRedemptions: card.totalRedemptions,
      status: card.status,
      stampsRequired: config.stampsRequired,
      rewardDescription: config.rewardDescription,
    },
  });
}
