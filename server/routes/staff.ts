import { Hono, type Context } from 'hono';
import bcrypt from 'bcryptjs';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client.js';
import {
  customers,
  loyaltyCards,
  loyaltyConfig,
  qrTokens,
  staffUsers,
  stampEvents,
} from '../../db/schema.js';
import { verifyQrToken } from '../../lib/jwt.js';
import { verify as verifyTotp } from '../../lib/totp.js';
import {
  applyActiveVisual,
  applyReadyToRedeemVisual,
  syncWalletPoints,
} from '../../lib/wallet/passVisual.js';
import {
  clearStaffSession,
  requireStaff,
  setStaffSession,
  type AppVariables,
} from '../middleware/auth.js';
import { methodNotAllowed } from '../middleware/methodNotAllowed.js';

export const staffRoutes = new Hono<{ Variables: AppVariables }>();

const LoginBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

const ScanBody = z.object({
  qrToken: z.string().min(10).max(4096),
});

const RedeemBody = z.object({
  cardId: z.string().uuid(),
});

const TOTP_PATTERN = /^gh:card:([0-9a-f-]{36}):(\d{6})$/;

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return undefined;
  }
}

staffRoutes.post('/staff/login', async (c) => {
  const body = await readJson(c);
  const parsed = LoginBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select({
      id: staffUsers.id,
      passwordHash: staffUsers.passwordHash,
      isActive: staffUsers.isActive,
      role: staffUsers.role,
      name: staffUsers.name,
    })
    .from(staffUsers)
    .where(eq(staffUsers.email, email))
    .limit(1);
  const staff = rows[0];

  if (!staff || !staff.isActive) {
    await bcrypt.compare(password, '$2a$10$abcdefghijklmnopqrstuu');
    return c.json({ error: 'invalid_credentials' }, 401);
  }

  const ok = await bcrypt.compare(password, staff.passwordHash);
  if (!ok) {
    return c.json({ error: 'invalid_credentials' }, 401);
  }

  await setStaffSession(c, staff.id);
  const role = staff.role === 'admin' ? 'admin' : 'staff';
  return c.json(
    { ok: true, staff: { id: staff.id, name: staff.name, email, role } },
    200,
  );
});

staffRoutes.post('/staff/logout', async (c) => {
  await clearStaffSession(c);
  return c.json({ ok: true }, 200);
});

staffRoutes.get('/staff/me', requireStaff, async (c) => {
  const principal = c.get('staff');
  const rows = await db
    .select({
      id: staffUsers.id,
      name: staffUsers.name,
      email: staffUsers.email,
      role: staffUsers.role,
      isActive: staffUsers.isActive,
    })
    .from(staffUsers)
    .where(eq(staffUsers.id, principal.id))
    .limit(1);
  const staff = rows[0];
  if (!staff || !staff.isActive) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const role = staff.role === 'admin' ? 'admin' : 'staff';
  return c.json(
    { id: staff.id, name: staff.name, email: staff.email, role },
    200,
  );
});

staffRoutes.post('/staff/redeem', requireStaff, async (c) => {
  const principal = c.get('staff');
  const body = await readJson(c);
  const parsed = RedeemBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { cardId } = parsed.data;

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
    if (existing.length === 0) return c.json({ error: 'card_not_found' }, 404);
    return c.json({ error: 'not_ready_to_redeem' }, 409);
  }

  await db.insert(stampEvents).values({
    cardId,
    type: 'redeem',
    staffId: principal.id,
  });

  if (flipped[0].googleObjectId) {
    await applyActiveVisual(flipped[0].googleObjectId);
  }

  const customerRows = await db
    .select({ name: customers.name })
    .from(customers)
    .where(eq(customers.id, flipped[0].customerId))
    .limit(1);

  return c.json(
    { ok: true, cardId, customerName: customerRows[0]?.name ?? '' },
    200,
  );
});

staffRoutes.post('/staff/scan', requireStaff, async (c) => {
  const principal = c.get('staff');
  const body = await readJson(c);
  const parsed = ScanBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { qrToken } = parsed.data;

  let claims: { jti: string; cardId: string } | null = null;
  let totpCardId: string | null = null;
  let totpCode: string | null = null;
  if (qrToken.startsWith('eyJ')) {
    try {
      claims = await verifyQrToken(qrToken);
    } catch {
      return c.json({ error: 'invalid_token' }, 400);
    }
  } else {
    const m = qrToken.match(TOTP_PATTERN);
    if (!m) {
      return c.json({ error: 'invalid_token' }, 400);
    }
    totpCardId = m[1];
    totpCode = m[2];
  }

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
      return c.json({ error: 'invalid_token' }, 400);
    }
    if (tokenRow.usedAt) {
      return c.json({ error: 'token_already_used' }, 409);
    }
    if (tokenRow.expiresAt.getTime() <= Date.now()) {
      return c.json({ error: 'token_expired' }, 400);
    }
    if (tokenRow.cardId !== claims.cardId) {
      return c.json({ error: 'invalid_token' }, 400);
    }
  }

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
    return c.json({ error: 'card_not_found' }, 404);
  }

  if (totpCode) {
    if (!card.totpSecret || !verifyTotp(card.totpSecret, totpCode)) {
      return c.json({ error: 'invalid_token' }, 400);
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

  if (card.status === 'ready_to_redeem') {
    return c.json(
      {
        action: 'awaiting_redeem' as const,
        cardId: card.id,
        customerName: card.customerName,
        stampsCount: card.stampsCount,
        stampsRequired: config.stampsRequired,
        status: 'ready_to_redeem' as const,
      },
      200,
    );
  }

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
      return c.json(
        {
          error: 'cooldown_active',
          retryAfterSeconds: Math.ceil(config.scanCooldownSeconds - ageSeconds),
        },
        429,
      );
    }
  }

  if (claims) {
    const now = new Date();
    const consumed = await db
      .update(qrTokens)
      .set({ usedAt: now })
      .where(and(eq(qrTokens.jti, claims.jti), isNull(qrTokens.usedAt)))
      .returning({ jti: qrTokens.jti });
    if (consumed.length === 0) {
      return c.json({ error: 'token_already_used' }, 409);
    }
  }

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

  if (card.googleObjectId) {
    await syncWalletPoints(card.googleObjectId, newCount);
    if (justBecameRedeemable) {
      await applyReadyToRedeemVisual(card.googleObjectId);
    }
  }

  return c.json(
    {
      action: 'stamped' as const,
      cardId: card.id,
      customerName: card.customerName,
      stampsCount: newCount,
      stampsRequired: config.stampsRequired,
      status: nextStatus,
      justBecameRedeemable,
    },
    200,
  );
});

staffRoutes.all('/staff/login', methodNotAllowed(['POST']));
staffRoutes.all('/staff/logout', methodNotAllowed(['POST']));
staffRoutes.all('/staff/me', methodNotAllowed(['GET']));
staffRoutes.all('/staff/scan', methodNotAllowed(['POST']));
staffRoutes.all('/staff/redeem', methodNotAllowed(['POST']));
