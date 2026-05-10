import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards, magicLinks } from '../../db/schema';
import { hashOpaqueToken, newOpaqueToken } from '../../lib/jwt';
import { sendMagicLink } from '../../lib/email';
import { customerSaveUrl } from '../../lib/wallet/customer';
import { clearCustomerSession, setCustomerSession, type AppVariables } from '../middleware/auth';
import { methodNotAllowed } from '../middleware/methodNotAllowed';

export const authRoutes = new Hono<{ Variables: AppVariables }>();

const RegisterBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
});

const LoginBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

const MAGIC_LINK_TTL_MS = 1000 * 60 * 60 * 24; // 24h

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return undefined;
  }
}

function baseUrl(c: Context): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  return `https://${c.req.header('host') ?? 'localhost'}`;
}

authRoutes.post('/auth/register', async (c) => {
  const body = await readJson(c);
  const parsed = RegisterBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { name, email } = parsed.data;

  const inserted = await db
    .insert(customers)
    .values({ name, email })
    .onConflictDoUpdate({ target: customers.email, set: { name } })
    .returning({ id: customers.id, name: customers.name });

  const customer = inserted[0];
  if (!customer) {
    return c.json({ error: 'customer_upsert_failed' }, 500);
  }

  await db
    .insert(loyaltyCards)
    .values({ customerId: customer.id })
    .onConflictDoNothing({ target: loyaltyCards.customerId });

  const { token, hash } = newOpaqueToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await db.insert(magicLinks).values({
    tokenHash: hash,
    customerId: customer.id,
    expiresAt,
  });

  const url = `${baseUrl(c)}/loyalty/verify?token=${token}`;

  let walletSaveUrl: string | undefined;
  try {
    walletSaveUrl = await customerSaveUrl(customer.id);
  } catch (err) {
    console.error('[register] wallet object creation failed:', (err as Error).message);
  }

  try {
    await sendMagicLink({
      to: email,
      name: customer.name,
      url,
      kind: 'register',
      walletSaveUrl,
    });
  } catch (err) {
    return c.json({ error: 'email_send_failed', message: (err as Error).message }, 502);
  }

  return c.json({ ok: true }, 200);
});

authRoutes.post('/auth/login', async (c) => {
  const body = await readJson(c);
  const parsed = LoginBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', details: parsed.error.flatten() }, 400);
  }
  const { email } = parsed.data;

  const rows = await db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  const customer = rows[0];

  if (!customer) {
    return c.json({ ok: true }, 200);
  }

  const { token, hash } = newOpaqueToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await db.insert(magicLinks).values({
    tokenHash: hash,
    customerId: customer.id,
    expiresAt,
  });

  const url = `${baseUrl(c)}/loyalty/verify?token=${token}`;

  let walletSaveUrl: string | undefined;
  try {
    walletSaveUrl = await customerSaveUrl(customer.id);
  } catch (err) {
    console.error('[login] wallet save URL build failed:', (err as Error).message);
  }

  try {
    await sendMagicLink({ to: email, name: customer.name, url, kind: 'login', walletSaveUrl });
  } catch (err) {
    return c.json({ error: 'email_send_failed', message: (err as Error).message }, 502);
  }

  return c.json({ ok: true }, 200);
});

/**
 * Magic-link landing handler. Exported so it can be mounted both at
 * /api/auth/verify (canonical API path) and at /loyalty/verify (public
 * URL shipped in email CTAs).
 */
export const verifyMagicLinkHandler = async (c: Context): Promise<Response> => {
  const token = c.req.query('token');
  if (!token) {
    return c.redirect('/loyalty?error=missing_token', 302);
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
    return c.redirect('/loyalty?error=invalid_or_expired', 302);
  }

  await db.update(magicLinks).set({ usedAt: now }).where(eq(magicLinks.tokenHash, hash));

  await db
    .update(customers)
    .set({ emailVerifiedAt: now })
    .where(eq(customers.id, link.customerId));

  await db
    .insert(loyaltyCards)
    .values({ customerId: link.customerId })
    .onConflictDoNothing({ target: loyaltyCards.customerId });

  await setCustomerSession(c, link.customerId);
  return c.redirect('/loyalty/card', 302);
};

authRoutes.get('/auth/verify', verifyMagicLinkHandler);

authRoutes.post('/auth/logout', (c) => {
  clearCustomerSession(c);
  return c.json({ ok: true }, 200);
});

authRoutes.all('/auth/register', methodNotAllowed(['POST']));
authRoutes.all('/auth/login', methodNotAllowed(['POST']));
authRoutes.all('/auth/verify', methodNotAllowed(['GET']));
authRoutes.all('/auth/logout', methodNotAllowed(['POST']));
