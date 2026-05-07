# Loyalty Card — Progress Tracker

Companion to `plan.md`. Update step status here as work lands. Each step references the "Implementation order" section of the plan.

## Step status

- [x] **1. Infra scaffold** — Drizzle schema (`db/schema.ts`), Neon serverless client (`db/client.ts`), first migration (`db/migrations/0000_easy_runaways.sql`), `loyalty_config` seed migration in `_journal.json`. `vercel.json` pins `api/**/*.ts` to 10s.
- [x] **2. Auth + registration** — `api/auth/{register,verify,login,logout}.ts`, `lib/jwt.ts` (HS256 + opaque-token hashing), `lib/email.ts` (Resend with stdout dev fallback), `lib/auth.ts` (`setCustomerSession` / `getCustomerId` / `requireCustomer`), `api/account/me.ts`.
- [x] **3. Google Wallet pass** — `lib/wallet/{google,loyaltyClass,customer}.ts`, `scripts/wallet-create-class.ts`, `scripts/wallet-build-{hero-image,mockup}.ts`, `scripts/wallet-preview-link.ts`, per-customer `LoyaltyObject` + Save flow (commit `bab5fe9`).
- [ ] **4. Staff PWA + scan endpoint** — *not started*. Need: `scan/` Vite entry, `src/scan/`, `api/staff/{login,logout,me,scan}.ts`. Schema for `staff_users` / `staff_sessions` / `qr_tokens` / `stamp_events` is already in `db/schema.ts`.
- [ ] **5. Rotating QR + replay protection** — schema scaffolded (`qr_tokens` table, `scan_cooldown_seconds` / `qr_token_ttl_seconds` in `loyalty_config`); endpoint + Wallet REST push not yet implemented.
- [ ] **6. Redemption flow + status visual change** — *not started*. Needs `api/staff/redeem.ts` and pass background swap via Wallet REST API.
- [ ] **7. Admin page** — *not started*. Needs `/admin` route, `api/admin/{config,staff}.ts`.
- [ ] **8. GDPR polish** — *not started*. Needs `api/account/delete.ts`, privacy-policy update, "delete my account" UI.

## Open questions / decisions to revisit

- Rotating-barcode mechanism: the plan documents both `rotatingBarcode.totpDetails` (client-side TOTP) and server-pushed updates as alternatives. Re-confirm before implementing step 5 — TOTP avoids the 30s cron and reduces Wallet API quota.
- Whether to keep "login.ts" / "logout.ts" alongside magic-link verify, or fold them in (commit `37970a2` mentions register/login email split).

## Branch tracking

- Active development branch: `loyalty-wallet`.
- Originally assigned environment branch: `claude/switch-loyalty-wallet-83kMV` (superseded by user instruction).

## Changelog

- 2026-05-07 — Plan stored in repo (`plan.md`); progress tracker initialized based on code inspection of branch `loyalty-wallet` at HEAD `bab5fe9`.
