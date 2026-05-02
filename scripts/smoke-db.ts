// One-shot smoke test: same code path as api/health.ts.
// Run with: node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/smoke-db.ts
import { sql } from 'drizzle-orm';
import { db } from '../db/client';

const result = await db.execute(sql`select 1 as ok`);
const tables = await db.execute(
  sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
);

console.log(JSON.stringify({
  ok: result.rows[0]?.ok === 1,
  tables: tables.rows.map((r) => r.table_name),
}, null, 2));
