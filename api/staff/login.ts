import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { staffUsers } from '../../db/schema';
import { setStaffSession } from '../../lib/auth';

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_input', details: parsed.error.flatten() });
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

  // Constant-ish response on bad creds — don't leak which staff emails exist.
  if (!staff || !staff.isActive) {
    // Still hash a dummy to avoid trivial timing oracles for the non-existent path.
    await bcrypt.compare(password, '$2a$10$abcdefghijklmnopqrstuu');
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const ok = await bcrypt.compare(password, staff.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  await setStaffSession(res, staff.id);
  const role = staff.role === 'admin' ? 'admin' : 'staff';
  return res.status(200).json({
    ok: true,
    staff: { id: staff.id, name: staff.name, email, role },
  });
}
