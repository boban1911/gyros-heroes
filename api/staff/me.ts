import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { staffUsers } from '../../db/schema';
import { requireStaff } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const principal = await requireStaff(req, res);
  if (!principal) return;

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
    return res.status(401).json({ error: 'unauthorized' });
  }

  const role = staff.role === 'admin' ? 'admin' : 'staff';
  return res.status(200).json({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role,
  });
}
