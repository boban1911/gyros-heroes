import { Hono } from 'hono';
import type { AppVariables } from './middleware/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes, verifyMagicLinkHandler } from './routes/auth.js';
import { accountRoutes } from './routes/account.js';
import { walletRoutes } from './routes/wallet.js';
import { staffRoutes } from './routes/staff.js';
import { adminRoutes } from './routes/admin.js';

export const app = new Hono<{ Variables: AppVariables }>();

// Public landing for magic-link emails. Mounted at the root (not under /api)
// because the email CTA links to /loyalty/verify directly. Vercel rewrites
// /loyalty/verify → /api (the catch-all function) but the function still sees
// the original URL, so we match it here.
app.get('/loyalty/verify', verifyMagicLinkHandler);

// All API routes mount under /api.
const api = app.basePath('/api');
api.route('/', healthRoutes);
api.route('/', authRoutes);
api.route('/', accountRoutes);
api.route('/', walletRoutes);
api.route('/', staffRoutes);
api.route('/', adminRoutes);

app.notFound((c) => c.json({ error: 'not_found' }, 404));

app.onError((err, c) => {
  console.error('[server.onError]', err);
  return c.json({ error: 'internal_error', message: (err as Error).message }, 500);
});

export default app;
