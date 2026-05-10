import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { staffUsers } from '../../db/schema';
import { requireAdmin } from '../../lib/auth';

const CreateBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(['staff', 'admin']),
});

const PatchBody = z.object({
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const principal = await requireAdmin(req, res);
  if (!principal) return;

  if (req.method === 'GET') {
    const rows = await db
      .select(STAFF_COLUMNS)
      .from(staffUsers)
      .orderBy(desc(staffUsers.createdAt));
    return res.status(200).json({ staff: rows });
  }

  if (req.method === 'POST') {
    const parsed = CreateBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
    }
    const { email, name, password, role } = parsed.data;

    const existing = await db
      .select({ id: staffUsers.id })
      .from(staffUsers)
      .where(eq(staffUsers.email, email))
      .limit(1);
    if (existing[0]) {
      return res.status(409).json({ error: 'email_already_exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const inserted = await db
      .insert(staffUsers)
      .values({ email, name, passwordHash, role })
      .returning(STAFF_COLUMNS);
    const row = inserted[0];
    if (!row) {
      return res.status(500).json({ error: 'insert_failed' });
    }
    return res.status(201).json(row);
  }

  // PATCH
  const parsed = PatchBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
  }
  const { id, isActive } = parsed.data;

  if (id === principal.id && !isActive) {
    return res.status(400).json({ error: 'cannot_deactivate_self' });
  }

  const updated = await db
    .update(staffUsers)
    .set({ isActive })
    .where(eq(staffUsers.id, id))
    .returning(STAFF_COLUMNS);
  const row = updated[0];
  if (!row) {
    return res.status(404).json({ error: 'staff_not_found' });
  }
  return res.status(200).json(row);
}
