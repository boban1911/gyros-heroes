import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

let cachedDb: NeonHttpDatabase<typeof schema> | null = null;
let cachedSql: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (cachedDb) return cachedDb;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  cachedSql = neon(databaseUrl);
  cachedDb = drizzle(cachedSql, { schema });
  return cachedDb;
}

// Proxy so existing `import { db } from '...'` callers keep working without
// running the env check at module load time. `vercel dev` injects env vars
// after the function file is imported, so a top-level throw races the env.
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
