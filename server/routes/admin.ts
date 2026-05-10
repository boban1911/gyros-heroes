import { Hono, type Context } from 'hono';
import bcrypt from 'bcryptjs';
import { desc, eq, max } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { customers, loyaltyCards, loyaltyConfig, staffUsers, stampEvents } from '../../db/schema';
import { expirePass } from '../../lib/wallet/passLifecycle';
import { requireAdmin, type AppVariables } from '../middleware/auth';
import { methodNotAllowed } from '../middleware/methodNotAllowed';

export const adminRoutes = new Hono<{ Variables: AppVariables }>();

const ConfigBody = z.object({
  stampsRequired: z.number().int().min(1).max(100),
  rewardDescription: z.string().trim().min(1).max(200),
  scanCooldownSeconds: z.number().int().min(0).max(86_400),
  qrTokenTtlSeconds: z.number().int().min(10).max(3_600),
});

const StaffCreateBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(['staff', 'admin']),
});

const StaffPatchBody = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const STAFF_COLUMNS = {
  id: staffUsers.id,
  email: staffUsers.email,
  name: staffUsers.name,
  role: staffUsers.role,
  isActive: staffUsers.isActive,
  createdAt: staffUsers.createdAt,
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return undefined;
  }
}

// ---------- /admin/config ----------

adminRoutes.get('/admin/config', requireAdmin, async (c) => {
  const rows = await db
    .select({
      id: loyaltyConfig.id,
      stampsRequired: loyaltyConfig.stampsRequired,
      rewardDescription: loyaltyConfig.rewardDescription,
      scanCooldownSeconds: loyaltyConfig.scanCooldownSeconds,
      qrTokenTtlSeconds: loyaltyConfig.qrTokenTtlSeconds,
      updatedAt: loyaltyConfig.updatedAt,
    })
    .from(loyaltyConfig)
    .where(eq(loyaltyConfig.id, 1))
    .limit(1);
  const row = rows[0];
  if (!row) return c.json({ error: 'config_not_found' }, 404);
  return c.json(row, 200);
});

adminRoutes.put('/admin/config', requireAdmin, async (c) => {
  const body = await readJson(c);
  const parsed = ConfigBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }

  const updated = await db
    .update(loyaltyConfig)
    .set({
      stampsRequired: parsed.data.stampsRequired,
      rewardDescription: parsed.data.rewardDescription,
      scanCooldownSeconds: parsed.data.scanCooldownSeconds,
      qrTokenTtlSeconds: parsed.data.qrTokenTtlSeconds,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyConfig.id, 1))
    .returning({
      id: loyaltyConfig.id,
      stampsRequired: loyaltyConfig.stampsRequired,
      rewardDescription: loyaltyConfig.rewardDescription,
      scanCooldownSeconds: loyaltyConfig.scanCooldownSeconds,
      qrTokenTtlSeconds: loyaltyConfig.qrTokenTtlSeconds,
      updatedAt: loyaltyConfig.updatedAt,
    });
  const row = updated[0];
  if (!row) return c.json({ error: 'config_not_found' }, 404);
  return c.json(row, 200);
});

// ---------- /admin/customers ----------

adminRoutes.get('/admin/customers', requireAdmin, async (c) => {
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

  return c.json({ customers: result }, 200);
});

adminRoutes.delete('/admin/customers', requireAdmin, async (c) => {
  const id = c.req.query('id') ?? null;
  if (!id || !UUID_RE.test(id)) {
    return c.json({ error: 'invalid_id' }, 400);
  }

  const existing = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!existing[0]) {
    return c.json({ error: 'customer_not_found' }, 404);
  }

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

  await db.delete(customers).where(eq(customers.id, id));

  return c.json({ ok: true }, 200);
});

// ---------- /admin/staff ----------

adminRoutes.get('/admin/staff', requireAdmin, async (c) => {
  const rows = await db
    .select(STAFF_COLUMNS)
    .from(staffUsers)
    .orderBy(desc(staffUsers.createdAt));
  return c.json({ staff: rows }, 200);
});

adminRoutes.post('/admin/staff', requireAdmin, async (c) => {
  const body = await readJson(c);
  const parsed = StaffCreateBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { email, name, password, role } = parsed.data;

  const existing = await db
    .select({ id: staffUsers.id })
    .from(staffUsers)
    .where(eq(staffUsers.email, email))
    .limit(1);
  if (existing[0]) {
    return c.json({ error: 'email_already_exists' }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const inserted = await db
    .insert(staffUsers)
    .values({ email, name, passwordHash, role })
    .returning(STAFF_COLUMNS);
  const row = inserted[0];
  if (!row) {
    return c.json({ error: 'insert_failed' }, 500);
  }
  return c.json(row, 201);
});

adminRoutes.patch('/admin/staff', requireAdmin, async (c) => {
  const principal = c.get('staff');
  const body = await readJson(c);
  const parsed = StaffPatchBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { id, isActive } = parsed.data;

  if (id === principal.id && !isActive) {
    return c.json({ error: 'cannot_deactivate_self' }, 400);
  }

  const updated = await db
    .update(staffUsers)
    .set({ isActive })
    .where(eq(staffUsers.id, id))
    .returning(STAFF_COLUMNS);
  const row = updated[0];
  if (!row) {
    return c.json({ error: 'staff_not_found' }, 404);
  }
  return c.json(row, 200);
});

adminRoutes.all('/admin/config', methodNotAllowed(['GET', 'PUT']));
adminRoutes.all('/admin/customers', methodNotAllowed(['GET', 'DELETE']));
adminRoutes.all('/admin/staff', methodNotAllowed(['GET', 'POST', 'PATCH']));
