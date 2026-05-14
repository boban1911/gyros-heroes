/* eslint-disable no-console */
import { createLoyaltyClass, getLoyaltyClass, updateLoyaltyClass } from '../lib/wallet/google';
import { buildLoyaltyClass } from '../lib/wallet/loyaltyClass';

async function main(): Promise<void> {
  const classId = process.env.GOOGLE_WALLET_CLASS_ID;
  if (!classId) {
    console.error('GOOGLE_WALLET_CLASS_ID is not set');
    process.exit(1);
  }

  const reviewStatus = process.argv.includes('--submit') ? 'UNDER_REVIEW' : 'DRAFT';
  const spec = buildLoyaltyClass({ classId, reviewStatus });

  const existing = await getLoyaltyClass(classId);
  if (existing) {
    console.log(`Updating ${classId} (reviewStatus=${reviewStatus})…`);
    await updateLoyaltyClass(spec);
    console.log('OK — class updated.');
    return;
  }

  console.log(`Creating ${classId} (reviewStatus=${reviewStatus})…`);
  await createLoyaltyClass(spec);
  console.log('OK — class created.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
