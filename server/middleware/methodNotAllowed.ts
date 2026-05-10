import type { Context } from 'hono';

export const methodNotAllowed = (allowed: string[]) => (c: Context) => {
  c.header('Allow', allowed.join(', '));
  return c.json({ error: 'method_not_allowed' }, 405);
};
