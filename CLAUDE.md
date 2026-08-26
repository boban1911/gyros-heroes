# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page marketing site for "Gyros Heroes," a Serbian fast-food brand. The product is essentially one long-scrolling landing page (`src/pages/Home.tsx`) plus a secondary static `pozivnica/` HTML page bundled by Vite.

A loyalty-card feature is being added on top: customer registration + Google Wallet pass + staff scan PWA. The backend lives in `api/` (Vercel Functions) backed by Neon Postgres (`db/`, Drizzle ORM). See `conductor/tracks/loyalty_card_20260507/plan.md` for the full design and `conductor/tracks/loyalty_card_20260507/progress.md` for current step status.

## Commands

- `npm run dev` — Vite dev server (default port 5173).
- `npm run build` — `tsc` type-check then `vite build`. Type errors fail the build.
- `npm run type-check` — `tsc --noEmit` only.
- `npm run preview` — Serve the production build.
- `npm test` — Run Vitest (jsdom env, setup at `tests/setup.ts`).
- `npm test -- --coverage` — Coverage via `@vitest/coverage-v8`.
- `npm test -- tests/components/Hero.test.tsx` — Run a single test file.
- `npm test -- -t "renders the hero"` — Run tests matching a name pattern.
- `npm run db:generate` — Generate a new Drizzle migration from schema diffs.
- `npm run db:migrate` — Apply pending migrations to the Neon branch in `DATABASE_URL`.
- `npm run db:studio` — Open Drizzle Studio against the current branch.
- `vercel env pull .env.local` — Refresh local env vars (Neon `DATABASE_URL` etc.) from Vercel's Development environment.

## Architecture

- **Entry / routing.** `src/main.tsx` → `App.tsx` wraps a single `<Route path="/">` with `Home`. `AnalyticsTracker` (react-ga4) and `CookieBanner` are mounted globally. Adding pages means registering routes in `App.tsx` *and*, for separately bundled HTML entry points, adding them to `vite.config.ts` `build.rollupOptions.input` (see how `pozivnica` is wired).
- **Home composition.** `Home.tsx` renders `Navbar`, `Hero`, `AboutUs` eagerly and `lazy()` + `Suspense` for everything below the fold (`Menu`, `LocationsGallery`, `JoinUs`, `Testimonials`, `OrderHero`, `SEOContent`, `Footer`). New below-the-fold sections should follow the same lazy pattern; the shared `SectionSkeleton` fallback lives inline in this file.
- **Menu domain.** `src/data/menu.ts` is the single source of truth: a `MenuItem` discriminated union (`simple` | `layered`) with `MenuCategory`. `LayeredMenuItem` composes a base image with positioned `MenuItemLayer`s for visual variants (e.g., toppings). Filtering logic is isolated in `src/hooks/useMenuFilter.ts`. Rendering is split between `components/menu/MenuItemMobile` and `MenuItemDesktop` — keep responsive variants as separate components rather than branching inside one.
- **Layout primitives.** `src/components/layout/` provides slot-based `Section` wrappers used by feature sections to keep backgrounds/content consistent. Prefer extending these over re-implementing section chrome.
- **Design tokens.** All colors, fonts, spacing, shadows, and motion live in `tailwind.config.js` (`hero-blue`, `hero-blue-dark`, `hero-yellow`, `hero-green`, `dandelion`; fonts `montserrat`/`inter`; shadows `hero-xs`/`hero-focus`; durations `fast`/`base`/`slow`/`xl`; easings `standard`/`bounce`/`smooth`). Animation constants are also re-exported from `src/constants/animations.ts`. Avoid arbitrary Tailwind values — extend the config instead.
- **Assets.** Images live under `src/assets/` (mostly `.webp`) and are imported as ES modules so Vite fingerprints them. `vite-plugin-image-optimizer` re-compresses PNG/JPEG/WebP/AVIF/SVG at build time; SVGO config preserves IDs (favicon variables depend on this — see commit `80046eb`).
- **Tests.** `tests/` mirrors `src/` (`components/`, `pages/`, `integration/`). `tests/verify-assets.test.ts` and `tests/tailwind-theme.test.ts` guard against missing assets and theme drift — keep them passing when adding tokens or assets.
- **Backend (`api/`, `db/`, `lib/`, `server/`).** `api/index.ts` is a single Vercel Function that mounts the Hono app in `server/app.ts`; route handlers live under `server/routes/*.ts` (one file per domain — `account`, `admin`, `auth`, `health`, `staff`, `wallet`). `db/client.ts` is a Drizzle client over `@neondatabase/serverless` HTTP. `db/schema.ts` is the schema source of truth; `db/migrations/` is committed (custom seed migrations like `0001_seed_loyalty_config.sql` are hand-written and registered in `_journal.json`). Shared utilities are in `lib/` (`jwt.ts`, `email.ts`, `wallet/`) and `server/middleware/` (auth middlewares `requireCustomer` / `requireStaff` / `requireAdmin`). **All relative imports across `server/`, `db/`, `lib/` must use `.js` extensions** (ESM build requirement). `vercel.json` pins `api/**/*.ts` to a 10 s `maxDuration` and runs `db:migrate:ci` before each deploy.
- **Local dev.** Two servers: Vite on `:5173` (frontend HMR), `vercel dev` on `:3000` (Vercel Functions + `vercel.json` rewrites). Vite proxies `/api/*` to `:3000`, so frontend work is fine on `:5173`. Open `:3000` only when testing the scan PWA (`/scan/*`) — those routes are a separate Vite entry served via `vercel.json` rewrites that Vite at `:5173` doesn't know about. Details: `docs/local-dev.md`.
- **Admin auth is inline, not cross-bundle.** `/admin` renders its own login form when unauthenticated (`AdminLogin` in `src/pages/Admin.tsx`). After successful login the page re-bootstraps in place; non-admin staff get a "no access" view. **Do not reintroduce `navigate('/scan/login')` from the admin page** — cross-bundle redirects are fragile (the scan PWA lives in `scan/index.html`, served by `vercel.json` rewrites; redirecting to it from `/admin` made unauthenticated admins land on a different React app and broke on Vercel preview deployments).
- **Google Wallet sync invariant.** Any code path that mutates `loyaltyCards.stampsCount` (staff scan, admin manual stamp, bulk imports, …) **must** call `syncWalletPoints(googleObjectId, newCount)` from `lib/wallet/passVisual.ts`. The wallet pass's `loyaltyPoints.balance.int` is baked in at create time and only changes via explicit PATCH — skip this and the customer sees a stale count forever. The helper is best-effort (logs + swallows Wallet errors so DB writes never roll back). Details: `docs/google-wallet.md`.
- **Neon branching.** Production `DATABASE_URL` → Neon `main` branch; local + preview deployments use ephemeral branches via the Neon-Vercel integration. Pull the dev branch URL into `.env.local` with `vercel env pull`.

## Conventions

- TypeScript follows the Google style guide summarized in `conductor/code_styleguides/typescript.md`: no `any`, no default exports, no `var`, single quotes, explicit semicolons, `===`/`!==`, avoid type assertions. `lowerCamelCase` for values, `UpperCamelCase` for types/components, `CONSTANT_CASE` for module-level constants.
- React components are function components with named exports where practical; the existing codebase uses default exports for top-level components — match the surrounding file.
- Don't introduce a live API or fetch layer for content — static data in `src/data/` is the established pattern.
- Legal copy lives in `src/constants/legalText.tsx` and is rendered through `LegalModal`.

## Notes for AI assistants

- `GEMINI.md` contains overlapping (older) guidance; prefer this file. The `conductor/` directory holds product/track planning docs that explain *why* features exist but are not required reading for code changes.
- A built `dist/` and `coverage/` may be present in the working tree — never commit them and don't treat them as source.
- A Stop hook (`.claude/hooks/evaluate-claudemd.sh`) nudges Claude at the end of any turn that modified non-doc source files. The reminder asks for a brief evaluation of whether `CLAUDE.md` or any `docs/*.md` need updates, based only on what was just changed. Discussion-only turns don't trigger it.

## See also

Topic-specific docs in `docs/`, loaded on demand (not auto-included in context):

- [`docs/google-wallet.md`](docs/google-wallet.md) — issuer/class IDs, service account location, env vars, how the sync invariant is implemented end-to-end, testing.
- [`docs/email.md`](docs/email.md) — Resend env vars, the `/api/auth/*` email failure codes and what each one means, retry policy.
- [`docs/local-dev.md`](docs/local-dev.md) — `:5173` vs `:3000`, env pulls, common gotchas.
- [`docs/vercel-cli.md`](docs/vercel-cli.md) — CLI 53.3.2 quirks (the `preview --yes` branch bug, secret piping).
- [`conductor/code_styleguides/typescript.md`](conductor/code_styleguides/typescript.md) — full TS style guide.
