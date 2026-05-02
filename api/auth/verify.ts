import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards, magicLinks } from '../../db/schema';
import { hashOpaqueToken } from '../../lib/jwt';
import { setCustomerSession } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = typeof req.query.token === 'string' ? req.query.token : null;
  if (!token) {
    return res.redirect(302, '/loyalty?error=missing_token');
  }

  const hash = hashOpaqueToken(token);
  const now = new Date();

  const rows = await db
    .select({ id: magicLinks.tokenHash, customerId: magicLinks.customerId })
    .from(magicLinks)
    .where(and(eq(magicLinks.tokenHash, hash), isNull(magicLinks.usedAt), gt(magicLinks.expiresAt, now)))
    .limit(1);

  const link = rows[0];
  if (!link) {
    return res.redirect(302, '/loyalty?error=invalid_or_expired');
  }

  // Mark link consumed.
  await db.update(magicLinks).set({ usedAt: now }).where(eq(magicLinks.tokenHash, hash));

  // Mark email verified (idempotent).
  await db
    .update(customers)
    .set({ emailVerifiedAt: now })
    .where(eq(customers.id, link.customerId));

  // Ensure the customer has a loyalty card.
  await db
    .insert(loyaltyCards)
    .values({ customerId: link.customerId })
    .onConflictDoNothing({ target: loyaltyCards.customerId });

  await setCustomerSession(res, link.customerId);
  return res.redirect(302, '/loyalty/card');
}
