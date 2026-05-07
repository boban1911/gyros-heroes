import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearStaffSession } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  await clearStaffSession(req, res);
  return res.status(200).json({ ok: true });
}
