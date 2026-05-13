# Local development stack

Two servers, two ports. Which one to open depends on what you're testing.

## The two processes

- **`vercel dev --listen 3000`** — emulates the production Vercel edge. Runs the single Vercel Function (`api/index.ts`, which mounts the Hono app from `server/app.ts`), applies `vercel.json` rewrites, and proxies the SPA back to Vite. Source `.env.local` into its parent shell first or Neon/Wallet env vars are missing. The committed `.claude/launch.json` already does this (`set -a; source .env.local; set +a; exec npx vercel dev --listen 3000`).
- **`npm run dev`** — Vite on `:5173`. The actual frontend dev surface (HMR, fast reloads). `vite.config.ts` has a `server.proxy` block that forwards `/api/*` → `http://localhost:3000` so DB-backed endpoints work from `:5173` too.

## Which port to open

- **`:5173`** — fine for any pure frontend work or anything that hits `/api/*`. Vite's HMR is faster and the SPA fallback covers React Router routes that exist (`/`, `/loyalty`, `/loyalty/card`, `/admin`).
- **`:3000`** — required when:
  - You hit the **scan PWA** (`/scan`, `/scan/login`, etc.). These are a separate Vite entry routed via `vercel.json` rewrites that `:5173` doesn't know about. Loading `/scan/login` on `:5173` returns a blank page.
  - You want fully prod-like behavior.
  - (Note: `/admin` now renders an inline login when unauthenticated — no longer redirects to `/scan/login` — so admin testing works fine on `:5173` too.)

## Common gotchas

- **`DATABASE_URL is not set` per request.** `db/client.ts` lazy-loads env, so the failure surfaces only when a query runs, not at startup. Means: if you start `vercel dev` without sourcing `.env.local`, the server starts fine but every DB-backed endpoint 500s.
- **Missing `server.proxy` in `vite.config.ts`.** The working tree has been seen with the block deleted, which makes `:5173` serve `/api/*` files as raw JS (Vite happily transforms TypeScript and ships it). Symptom: `Unexpected token 'i', "import { e"...` in the browser. Fix: restore the proxy block targeting `http://localhost:3000`.
- **Stale env after Vercel changes.** Run `vercel env pull .env.local` after adding/removing keys in the Vercel dashboard.

## Refreshing `.env.local` from Vercel

```sh
vercel env pull .env.local
```

This downloads the Development environment's vars. To pull a different environment (e.g., for testing against the loyalty-wallet preview branch's Neon DB):

```sh
vercel env pull .env.preview-loyalty --environment=preview --git-branch=loyalty-wallet
```

Both files are gitignored. Don't commit them.

## Restarting after env changes

`vercel dev` reads env at startup. After `vercel env pull` or editing `.env.local`, restart `vercel dev`. Vite (`:5173`) on the other hand reloads on file changes automatically.
