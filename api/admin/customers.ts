import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, eq, max } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards, stampEvents } from '../../db/schema';
import { requireAdmin } from '../../lib/auth';
import { expirePass } from '../../lib/wallet/passLifecycle';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, DELETE');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const principal = await requireAdmin(req, res);
  if (!principal) return;

  if (req.method === 'GET') {
    const customerRows = await db
      .select({
        id: customers.id,
        email: customers.email,
        name: customers.name,
        emailVerifiedAt: customers.emailVerifiedAt,
        createdAt: customers.createdAt,
        cardId: loyaltyCards.id,
        stampsCount: loyaltyCards.stampsCount,
        totalRedemptions: loyaltyCards.totalRedemptions,
        status: loyaltyCards.status,
        googleObjectId: loyaltyCards.googleObjectId,
        cardCreatedAt: loyaltyCards.createdAt,
      })
      .from(customers)
      .leftJoin(loyaltyCards, eq(loyaltyCards.customerId, customers.id))
      .orderBy(desc(customers.createdAt));

    const lastStampRows = await db
      .select({
        cardId: stampEvents.cardId,
        lastStampAt: max(stampEvents.createdAt),
      })
      .from(stampEvents)
      .where(eq(stampEvents.type, 'stamp'))
      .groupBy(stampEvents.cardId);

    const lastStampByCard = new Map<string, string>();
    for (const row of lastStampRows) {
      if (row.cardId && row.lastStampAt) {
        lastStampByCard.set(
          row.cardId,
          row.lastStampAt instanceof Date ? row.lastStampAt.toISOString() : String(row.lastStampAt),
        );
      }
    }

    const result = customerRows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      emailVerifiedAt: row.emailVerifiedAt instanceof Date ? row.emailVerifiedAt.toISOString() : row.emailVerifiedAt,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      card: row.cardId
        ? {
            id: row.cardId,
            stampsCount: row.stampsCount ?? 0,
            totalRedemptions: row.totalRedemptions ?? 0,
            status: row.status ?? 'active',
            hasWalletPass: Boolean(row.googleObjectId),
            createdAt: row.cardCreatedAt instanceof Date ? row.cardCreatedAt.toISOString() : row.cardCreatedAt,
            lastStampAt: lastStampByCard.get(row.cardId) ?? null,
          }
        : null,
    }));

    return res.status(200).json({ customers: result });
  }

  // DELETE — admin force-delete a customer (no OBRIŠI confirm; admin-gated).
  const id = typeof req.query.id === 'string' ? req.query.id : null;
  if (!id || !UUID_RE.test(id)) {
    return res.status(400).json({ error: 'invalid_id' });
  }

  const existing = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!existing[0]) {
    return res.status(404).json({ error: 'customer_not_found' });
  }

  // Best-effort: expire the Google Wallet pass before the cascade DELETE
  // strips the googleObjectId we'd need to address it. expirePass swallows
  // its own errors; the try/catch is belt-and-suspenders.
  const cardRows = await db
    .select({ googleObjectId: loyaltyCards.googleObjectId })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.customerId, id))
    .limit(1);
  const googleObjectId = cardRows[0]?.googleObjectId ?? null;
  if (googleObjectId) {
    try {
      await expirePass(googleObjectId);
    } catch (err) {
      console.error('[admin/customers]', err);
    }
  }

  // FK cascades wipe magic_links, loyalty_cards, stamp_events, qr_tokens.
  await db.delete(customers).where(eq(customers.id, id));

  return res.status(200).json({ ok: true });
}
