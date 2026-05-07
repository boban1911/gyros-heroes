/* eslint-disable no-console */
/**
 * One-off: create a throwaway LoyaltyObject and print a Save-to-Google-Wallet
 * link so we can preview the card on a phone before any customer-facing UI
 * exists. Run again any time — the object id is timestamp-based so each run
 * creates a fresh object.
 *
 * Usage:
 *   npm run wallet:preview-link [-- --stamps 4]
 *
 * Open the printed URL on an Android device signed into the issuer Google
 * account. Save the pass; then check how it renders. Optionally delete the
 * preview pass from the wallet afterwards.
 */
import {
  createLoyaltyObject,
  signSaveJwt,
  type LoyaltyObjectSpec,
} from '../lib/wallet/google';

const STAMPS_DEFAULT = 3;
const STAMPS_REQUIRED = 10;

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return fallback;
}

async function main(): Promise<void> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID;
  if (!issuerId || !classId) {
    console.error('GOOGLE_WALLET_ISSUER_ID and GOOGLE_WALLET_CLASS_ID must be set in .env.local');
    process.exit(1);
  }

  const stamps = Number(arg('stamps', String(STAMPS_DEFAULT)));
  if (!Number.isFinite(stamps) || stamps < 0 || stamps > STAMPS_REQUIRED) {
    console.error(`--stamps must be 0..${STAMPS_REQUIRED}`);
    process.exit(1);
  }

  const objectId = `${issuerId}.preview_${Date.now()}`;
  const ready = stamps >= STAMPS_REQUIRED;

  const spec: LoyaltyObjectSpec = {
    id: objectId,
    classId,
    state: 'ACTIVE',
    accountName: 'Boban (preview)',
    accountId: 'preview',
    loyaltyPoints: {
      label: 'Pečati',
      balance: { int: stamps },
    },
    secondaryLoyaltyPoints: {
      label: 'Cilj',
      balance: { int: STAMPS_REQUIRED },
    },
    barcode: {
      type: 'QR_CODE',
      value: `gh:preview:${objectId}`,
      alternateText: 'Preview',
    },
    textModulesData: ready
      ? [
          {
            id: 'reward_ready',
            header: '🎉 Spremno za nagradu',
            body: 'Pokaži ovu karticu na kasi i osvoji besplatan gyros.',
          },
        ]
      : [],
  };

  console.log(`Creating preview LoyaltyObject ${objectId} (stamps=${stamps}/${STAMPS_REQUIRED})…`);
  await createLoyaltyObject(spec);

  const saveJwt = await signSaveJwt([{ id: objectId, classId }]);
  const url = `https://pay.google.com/gp/v/save/${saveJwt}`;

  console.log('');
  console.log('Open this URL on an Android device signed in to the issuer Google account:');
  console.log('');
  console.log(`  ${url}`);
  console.log('');
  console.log('You can also paste it into a phone-side QR generator and scan from your laptop.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
