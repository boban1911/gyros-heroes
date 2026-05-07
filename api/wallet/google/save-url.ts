import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireCustomer } from '../../../lib/auth';
import { customerSaveUrl } from '../../../lib/wallet/customer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const customerId = await requireCustomer(req, res);
  if (!customerId) return;

  try {
    const url = await customerSaveUrl(customerId);
    return res.status(200).json({ url });
  } catch (err) {
    console.error('[wallet/save-url] failed:', (err as Error).message);
    return res
      .status(502)
      .json({ error: 'wallet_unavailable', message: (err as Error).message });
  }
}
