import { patchLoyaltyObject } from './google.js';

/**
 * Lifecycle state changes for the customer's Google Wallet LoyaltyObject.
 * Distinct from `passVisual.ts` (which only swaps the visible color/text
 * modules while keeping the pass `ACTIVE`); functions here transition the
 * pass between Google Wallet's lifecycle states (`ACTIVE`, `EXPIRED`, ...).
 *
 * Wallet REST is best-effort: any failure is logged and swallowed so the
 * caller (e.g. account deletion) is never blocked by Google's availability.
 */

export async function expirePass(googleObjectId: string): Promise<void> {
  try {
    await patchLoyaltyObject(googleObjectId, { state: 'EXPIRED' });
  } catch (err) {
    console.error('[wallet]', err);
  }
}
