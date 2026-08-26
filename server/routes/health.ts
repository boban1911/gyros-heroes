import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { emailConfigStatus } from '../../lib/email.js';

export const healthRoutes = new Hono();

healthRoutes.get('/health', async (c) => {
  try {
    const result = await db.execute(sql`select 1 as ok`);
    const ok = result.rows[0]?.ok === 1;
    return c.json(
      {
        ok,
        db: ok ? 'connected' : 'unexpected',
        // Surfaces a missing RESEND_API_KEY without having to trigger a real
        // registration. Never includes the key itself.
        email: emailConfigStatus(),
        ts: new Date().toISOString(),
      },
      200,
    );
  } catch (err) {
    return c.json(
      { ok: false, db: 'error', error: (err as Error).message },
      500,
    );
  }
});
