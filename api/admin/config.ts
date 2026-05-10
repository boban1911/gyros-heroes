import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { loyaltyConfig } from '../../db/schema';
import { requireAdmin } from '../../lib/auth';

const Body = z.object({
  stampsRequired: z.number().int().min(1).max(100),
  rewardDescription: z.string().trim().min(1).max(200),
  scanCooldownSeconds: z.number().int().min(0).max(86_400),
  qrTokenTtlSeconds: z.number().int().min(10).max(3_600),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const principal = await requireAdmin(req, res);
  if (!principal) return;

  if (req.method === 'GET') {
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
    if (!row) {
      return res.status(404).json({ error: 'config_not_found' });
    }
    return res.status(200).json(row);
  }

  // PUT
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
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
  if (!row) {
    return res.status(404).json({ error: 'config_not_found' });
  }
  return res.status(200).json(row);
}
