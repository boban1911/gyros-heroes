import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from 'drizzle-orm';
import { db } from '../db/client';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const result = await db.execute(sql`select 1 as ok`);
    const ok = result.rows[0]?.ok === 1;
    res.status(200).json({ ok, db: ok ? 'connected' : 'unexpected', ts: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'error', error: (err as Error).message });
  }
}
