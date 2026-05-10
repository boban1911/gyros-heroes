import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { customers, loyaltyCards } from '../../db/schema';
import { generateSecret } from '../totp';
import {
  createLoyaltyObject,
  getLoyaltyObject,
  signSaveJwt,
  type LoyaltyObjectSpec,
} from './google';

const STAMPS_REQUIRED = 10;

function envIds(): { issuerId: string; classId: string } {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID;
  if (!issuerId || !classId) {
    throw new Error('GOOGLE_WALLET_ISSUER_ID / GOOGLE_WALLET_CLASS_ID are not set');
  }
  return { issuerId, classId };
}

function objectIdFor(issuerId: string, customerId: string): string {
  // Google requires the object id to be in `<issuerId>.<unique>` format with
  // alphanum + . _ - allowed. UUID hex (no dashes) keeps things simple.
  return `${issuerId}.card_${customerId.replace(/-/g, '')}`;
}

/**
 * Ensure the customer's loyalty card has a TOTP secret, generating + persisting
 * one lazily for cards created before the rotating-barcode feature shipped.
 * Returns the (possibly newly minted) secret.
 */
async function ensureTotpSecret(cardId: string, existing: string | null): Promise<string> {
  if (existing) return existing;
  const secret = generateSecret();
  await db.update(loyaltyCards).set({ totpSecret: secret }).where(eq(loyaltyCards.id, cardId));
  return secret;
}

async function buildSpec(customerId: string): Promise<LoyaltyObjectSpec> {
  const { classId } = envIds();
  const [row] = await db
    .select({
      name: customers.name,
      cardId: loyaltyCards.id,
      stampsCount: loyaltyCards.stampsCount,
      totpSecret: loyaltyCards.totpSecret,
    })
    .from(customers)
    .innerJoin(loyaltyCards, eq(loyaltyCards.customerId, customers.id))
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!row) throw new Error(`No loyalty card for customer ${customerId}`);

  const totpSecret = await ensureTotpSecret(row.cardId, row.totpSecret);

  const { issuerId } = envIds();
  return {
    id: objectIdFor(issuerId, customerId),
    classId,
    state: 'ACTIVE',
    accountName: row.name,
    accountId: row.cardId,
    loyaltyPoints: { label: 'Pečati', balance: { int: row.stampsCount } },
    secondaryLoyaltyPoints: { label: 'Cilj', balance: { int: STAMPS_REQUIRED } },
    rotatingBarcode: {
      type: 'QR_CODE',
      valuePattern: `gh:card:${row.cardId}:{TOTP_VALUE_0}`,
      totpDetails: {
        algorithm: 'TOTP_SHA1',
        periodMillis: 30000,
        parameters: [{ key: totpSecret, valueLength: 6 }],
      },
    },
  };
}

/**
 * Ensure a Google Wallet LoyaltyObject exists for this customer. Idempotent
 * across the local DB column and Google's API. Returns the object id.
 *
 * Caller is responsible for handling errors — wallet creation is best-effort
 * during registration/login flows so that auth keeps working even if the
 * Wallet API is degraded.
 */
export async function ensureCustomerWalletObject(customerId: string): Promise<string> {
  const { issuerId } = envIds();
  const objectId = objectIdFor(issuerId, customerId);

  const [card] = await db
    .select({ id: loyaltyCards.id, googleObjectId: loyaltyCards.googleObjectId })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.customerId, customerId))
    .limit(1);
  if (!card) throw new Error(`No loyalty card for customer ${customerId}`);

  if (card.googleObjectId) return card.googleObjectId;

  // Defensive: maybe the object already exists on Google's side from a prior
  // partial run — adopt it instead of erroring on duplicate POST.
  const existing = await getLoyaltyObject(objectId);
  if (!existing) {
    const spec = await buildSpec(customerId);
    await createLoyaltyObject(spec);
  }
  await db
    .update(loyaltyCards)
    .set({ googleObjectId: objectId })
    .where(eq(loyaltyCards.id, card.id));
  return objectId;
}

/**
 * Build a Save-to-Google-Wallet URL for the customer's pass. Creates the
 * underlying LoyaltyObject on first call; subsequent calls reuse it.
 */
export async function customerSaveUrl(customerId: string): Promise<string> {
  const { classId } = envIds();
  const objectId = await ensureCustomerWalletObject(customerId);
  const jwt = await signSaveJwt([{ id: objectId, classId }]);
  return `https://pay.google.com/gp/v/save/${jwt}`;
}
