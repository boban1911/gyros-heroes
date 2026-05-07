// Seed (or upsert) a staff user. Idempotent on email — re-running with the
// same email rotates the password hash, name, and role and re-activates the
// user.
//
// Run with:
//   node --env-file=.env.local --import tsx scripts/seed-staff-user.ts \
//     --email=staff@gyrosheroes.rs --name='Staff Demo' --password='hunter2' [--role=staff|admin]

import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { staffUsers } from '../db/schema';

interface ParsedArgs {
  email: string;
  name: string;
  password: string;
  role: 'staff' | 'admin';
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: Record<string, string> = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq === -1) continue;
    const key = arg.slice(2, eq);
    const value = arg.slice(eq + 1);
    out[key] = value;
  }
  const email = out.email?.trim().toLowerCase();
  const name = out.name?.trim();
  const password = out.password;
  const roleRaw = (out.role ?? 'staff').trim().toLowerCase();
  if (!email || !name || !password) {
    throw new Error(
      'Missing required args. Usage: --email=... --name=... --password=... [--role=staff|admin]',
    );
  }
  if (roleRaw !== 'staff' && roleRaw !== 'admin') {
    throw new Error(`Invalid --role: ${roleRaw}. Must be 'staff' or 'admin'.`);
  }
  return { email, name, password, role: roleRaw };
}

async function main(): Promise<void> {
  const { email, name, password, role } = parseArgs(process.argv.slice(2));
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db
    .insert(staffUsers)
    .values({ email, name, passwordHash, role, isActive: true })
    .onConflictDoUpdate({
      target: staffUsers.email,
      set: { name, passwordHash, role, isActive: true },
    })
    .returning({ id: staffUsers.id, email: staffUsers.email, role: staffUsers.role });

  const row = result[0];
  if (!row) {
    throw new Error('Upsert returned no rows');
  }
  console.log(JSON.stringify({ ok: true, id: row.id, email: row.email, role: row.role }, null, 2));
}

main().catch((err) => {
  console.error('[seed-staff-user] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
