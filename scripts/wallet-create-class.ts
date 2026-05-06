/* eslint-disable no-console */
import { createLoyaltyClass, getLoyaltyClass, updateLoyaltyClass } from '../lib/wallet/google';
import { buildLoyaltyClass, loyaltyClassId } from '../lib/wallet/loyaltyClass';

async function main(): Promise<void> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  if (!issuerId) {
    console.error('GOOGLE_WALLET_ISSUER_ID is not set');
    process.exit(1);
  }

  const reviewStatus = process.argv.includes('--submit') ? 'UNDER_REVIEW' : 'DRAFT';
  const update = process.argv.includes('--update');

  const id = loyaltyClassId(issuerId);
  const spec = buildLoyaltyClass({ issuerId, reviewStatus });

  if (update) {
    const existing = await getLoyaltyClass(id);
    if (!existing) {
      console.error(`Class ${id} does not exist; run without --update to create it.`);
      process.exit(1);
    }
    console.log(`Updating ${id} (reviewStatus=${reviewStatus})…`);
    await updateLoyaltyClass(spec);
    console.log('OK — class updated.');
    return;
  }

  const existing = await getLoyaltyClass(id);
  if (existing) {
    console.error(`Class ${id} already exists. Use --update to overwrite, or change CLASS_SUFFIX.`);
    process.exit(1);
  }

  console.log(`Creating ${id} (reviewStatus=${reviewStatus})…`);
  await createLoyaltyClass(spec);
  console.log('OK — class created.');
  console.log('');
  console.log('Set this in Vercel env (and .env.local for dev):');
  console.log(`  GOOGLE_WALLET_CLASS_ID=${id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
