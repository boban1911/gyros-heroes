# Vercel CLI quirks

Workarounds for issues with the `vercel` CLI we hit in this repo. Worth checking whether they're still broken when upgrading.

## "Add to all preview branches" is broken (CLI 53.3.2)

The documented form for setting an env var across every preview branch without prompting:

```sh
vercel env add NAME preview --value VALUE --yes
```

…returns `{"status":"action_required","reason":"git_branch_required"}` and exits 1 — even though it's the exact command the CLI's own `next[]` hint tells you to run. The `--yes` flag doesn't satisfy the disambiguation prompt.

**Workaround:** specify the branch explicitly. Have to repeat per branch you care about:

```sh
vercel env add NAME preview loyalty-wallet --value VALUE --yes
vercel env add NAME preview master           --value VALUE --yes
```

Or use the Vercel dashboard, which has a working "All branches" toggle.

## Reaching the latest CLI when the global is outdated

`which vercel` may point to an old global install. Force the latest from npm:

```sh
npx vercel@latest <command>
```

To find the cached binary path (faster than `npx` on subsequent invocations):

```sh
ls ~/.npm/_npx/*/node_modules/.bin/vercel
```

## Piping secrets into `env add`

`vercel env add` reads from stdin when no `--value` flag is given. Prefer stdin for secrets — `--value` puts the value on the command line, visible to `ps`.

```sh
echo -n "VALUE" | vercel env add NAME development
printf '%s' "$BASE64_BLOB" | vercel env add NAME production
```

Stdin doesn't satisfy the per-branch disambiguation prompt either; you still need to pass the branch as a positional for `preview`.
