/* eslint-disable no-console */
/**
 * Simulate staff scanning a stamp on a customer's card. Bumps the local DB
 * stamps_count and patches the Google Wallet LoyaltyObject so the tier
 * number on the customer's wallet pass updates.
 *
 * Usage:
 *   npm run wallet:bump-stamp -- --email <customer-email>
 *   npm run wallet:bump-stamp -- --email <email> --by 3   # add 3 stamps
 *   npm run wallet:bump-stamp -- --email <email> --reset  # back to 0
 */
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { customers, loyaltyCards } from '../db/schema';
import { ensureCustomerWalletObject } from '../lib/wallet/customer';
import { patchLoyaltyObject } from '../lib/wallet/google';

const STAMPS_REQUIRED = 10;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main(): Promise<void> {
  const email = arg('email');
  if (!email) {
    console.error('Usage: --email <customer-email> [--by N] [--reset]');
    process.exit(1);
  }
  const by = Number(arg('by') ?? '1');
  const reset = flag('reset');
  if (!reset && (!Number.isFinite(by) || by === 0)) {
    console.error('--by must be a non-zero number');
    process.exit(1);
  }

  const [row] = await db
    .select({ cardId: loyaltyCards.id, stamps: loyaltyCards.stampsCount, customerId: customers.id })
    .from(customers)
    .innerJoin(loyaltyCards, eq(loyaltyCards.customerId, customers.id))
    .where(eq(customers.email, email.toLowerCase()))
    .limit(1);
  if (!row) {
    console.error(`No loyalty card for ${email}`);
    process.exit(1);
  }

  const before = row.stamps;
  const after = reset ? 0 : Math.max(0, Math.min(STAMPS_REQUIRED, before + by));
  const status = after >= STAMPS_REQUIRED ? 'ready_to_redeem' : 'active';

  await db
    .update(loyaltyCards)
    .set({ stampsCount: after, status })
    .where(eq(loyaltyCards.id, row.cardId));
  console.log(`DB    : ${before} → ${after}  (status=${status})`);

  // Make sure the wallet object exists, then patch its loyaltyPoints.
  const objectId = await ensureCustomerWalletObject(row.customerId);
  await patchLoyaltyObject(objectId, {
    loyaltyPoints: { label: 'Pečati', balance: { int: after } },
    state: status === 'ready_to_redeem' ? 'ACTIVE' : 'ACTIVE', // could swap on redeem
  });
  console.log(`Wallet: patched ${objectId} → ${after}/${STAMPS_REQUIRED}`);

  console.log('');
  console.log('Open the card on your phone to see the new count.');
  console.log('Refresh /loyalty/card on the website to see the progress.');

  // Drop database client so the script exits cleanly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sqlClient = (db as any).$client;
  if (typeof sqlClient?.end === 'function') await sqlClient.end();
}

// Touch sql so unused-import lints don't yell when we drop it later.
void sql;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
