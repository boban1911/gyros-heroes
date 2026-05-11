import { patchLoyaltyObject } from './google.js';

/**
 * Visual states for the customer's Google Wallet LoyaltyObject. The pass
 * stays lifecycle-`ACTIVE` throughout — we only swap the background color
 * and the `reward_status` text module so the customer's phone shows a
 * celebratory yellow card with banner copy when they're ready to redeem,
 * and reverts to the default brand-blue card after staff redeem.
 *
 * Wallet REST is best-effort: any failure (network, quota, 404, etc.) is
 * logged and swallowed. The scan/redeem endpoint must not roll back its
 * DB changes just because Google is slow.
 */

// Mirror tailwind.config.js — keep these in sync if the brand palette moves.
const HERO_BLUE = '#4866B0';
const HERO_YELLOW = '#FBAD18';

const READY_TEXT_MODULE = {
  id: 'reward_status',
  header: 'Spremno za nagradu!',
  body: 'Pokaži ovo osoblju.',
};

export async function applyReadyToRedeemVisual(googleObjectId: string): Promise<void> {
  try {
    await patchLoyaltyObject(googleObjectId, {
      state: 'ACTIVE',
      hexBackgroundColor: HERO_YELLOW,
      textModulesData: [READY_TEXT_MODULE],
    });
  } catch (err) {
    console.error('[wallet]', err);
  }
}

export async function applyActiveVisual(googleObjectId: string): Promise<void> {
  try {
    await patchLoyaltyObject(googleObjectId, {
      state: 'ACTIVE',
      hexBackgroundColor: HERO_BLUE,
      textModulesData: [],
    });
  } catch (err) {
    console.error('[wallet]', err);
  }
}

/**
 * Push the current stamp count to Google Wallet so the live pass shows the
 * same `loyaltyPoints` balance as the DB. Best-effort: failures are logged
 * and swallowed so DB writes are never rolled back because of Wallet issues.
 */
export async function syncWalletPoints(
  googleObjectId: string,
  stampsCount: number,
): Promise<void> {
  try {
    await patchLoyaltyObject(googleObjectId, {
      loyaltyPoints: { label: 'Pečati', balance: { int: stampsCount } },
    });
  } catch (err) {
    console.error('[wallet]', err);
  }
}
