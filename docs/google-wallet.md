# Google Wallet integration

Operational and design details for the customer-facing Google Wallet pass. The high-level invariant ("any code that mutates `stampsCount` must also call `syncWalletPoints`") lives in `CLAUDE.md`; this file holds the supporting detail.

## Identifiers

- **Issuer ID:** `3388000000023114652` (numeric).
- **Class ID:** `<issuerId>.<suffix>` where the suffix is defined in `lib/wallet/loyaltyClass.ts` (`gyros_heroes_loyalty_v1`). Full value: `3388000000023114652.gyros_heroes_loyalty_v1`.
- **Service account JSON:** stored at `~/.config/gyros-heroes/wallet-service-account.json` (mode 600). It's a credential — don't paste contents into chat, commit, or screenshots.

## Required env vars

| Name | Notes |
|---|---|
| `GOOGLE_WALLET_ISSUER_ID` | Numeric issuer ID as above. |
| `GOOGLE_WALLET_CLASS_ID` | Full `<issuer>.<suffix>` form. |
| `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON` | Accepts either raw JSON or base64-encoded JSON. `getServiceAccount()` in `lib/wallet/google.ts` sniffs the leading `{` to decide. Use base64 in `.env` files to avoid newline/quoting issues with the private key. |

To re-encode the service account JSON to base64:

```sh
base64 -i ~/.config/gyros-heroes/wallet-service-account.json | tr -d '\n'
```

## Which Vercel environments have them set

As of 2026-05-11, all three keys are configured for:

- ✅ Development
- ✅ Preview (loyalty-wallet)
- ✅ Preview (master)
- ✅ Production

**Future preview branches don't auto-inherit.** Add per-branch with `vercel env add NAME preview <branch> --value <value> --yes`. See `docs/vercel-cli.md` for the CLI quirk that makes "all preview branches" unusable today.

## How wallet updates flow

1. **Create.** `ensureCustomerWalletObject` (`lib/wallet/customer.ts`) is called at registration. It builds a `LoyaltyObjectSpec` with `loyaltyPoints.balance.int = stampsCount` and POSTs to Google. The pass is now in Google's system at `<issuerId>.card_<customerHex>`.

2. **Stamp.** Either `POST /staff/scan` or `POST /admin/customers/stamp` updates `loyaltyCards.stampsCount` in Postgres. Both call `syncWalletPoints(googleObjectId, newCount)` from `lib/wallet/passVisual.ts`, which PATCHes the live pass so the phone display matches the DB. The helper is best-effort: it logs and swallows Wallet errors so the DB write is never rolled back because Google is slow / down.

3. **Threshold visuals.** When `stampsCount` crosses `stampsRequired`, the status flips to `ready_to_redeem` and `applyReadyToRedeemVisual` paints the pass yellow with a "Spremno za nagradu!" text module. `applyActiveVisual` reverts to brand-blue when staff redeem. Visuals are independent of points — both calls happen for the same state transition.

4. **Self-heal.** `ensureCustomerWalletObject` also re-syncs on every visit to `/loyalty/card` — if a pass somehow drifted (e.g., a deploy that skipped `syncWalletPoints` calls), the customer reopening the page brings it back in line.

## Testing the live pass

- **iPhone does not support Google Wallet passes natively.** The rotating QR can only render in the Android Google Wallet app. Options if you don't have Android: Android Studio emulator with the Google Play system image, borrow an Android device for 5 minutes.
- **Desktop view** at https://wallet.google.com/wallet/passes is read-only but does reflect `loyaltyPoints` changes after a hard refresh — useful for verifying that `syncWalletPoints` actually patched.
- To force a re-sync without changing state: hit "Sačuvaj karticu u telefon" on `/loyalty/card` while logged in as the customer. `ensureCustomerWalletObject` will PATCH the pass to current DB state.

## When Wallet API calls fail

`walletFetch` in `lib/wallet/google.ts` throws on non-2xx responses. The helpers in `passVisual.ts` (`syncWalletPoints`, `applyReadyToRedeemVisual`, `applyActiveVisual`) wrap each call in try/catch and log to stderr — they never re-throw. This means:

- DB transactions complete even when Google is degraded.
- Failures show up as `[wallet]` lines in `vercel dev` / production logs.
- Customers see stale passes until the next successful sync. The self-heal path in `ensureCustomerWalletObject` makes this recoverable.

Do not change this pattern without thinking through the consequences — coupling DB writes to Google's availability would mean a Wallet outage breaks stamping entirely.
