# Transactional email (Resend)

Every magic link — registration and login alike — goes out through Resend from
`lib/email.ts`. If sending breaks, nobody can activate or open a Hero card, so
this is a critical path.

## Env vars

| Var | Where | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Vercel (Production + Preview), `.env.local` | Without it, a **deployment** now fails the request with `email_not_configured`; locally the link is logged to stdout instead of sent. |
| `RESEND_FROM_EMAIL` | Vercel, optional | Defaults to `loyalty@gyrosheroes.rs`. The domain part **must be a verified domain in the Resend account that owns the API key.** |

Quick check without triggering a real registration:

```sh
curl -s https://gyrosheroes.rs/api/health
# { "ok": true, "db": "connected", "email": { "configured": true, "from": "loyalty@gyrosheroes.rs" }, ... }
```

`configured: false` means the key is missing in that environment — fix that
before looking anywhere else.

## Failure codes

`POST /api/auth/register` and `/api/auth/login` answer with a stable `error`
code. The provider's own wording never reaches the browser — it is logged in
the Vercel function logs as `[register] magic-link email failed { code,
statusCode, providerMessage, to }`. Look there first.

| Code | HTTP | What actually happened | Fix |
| --- | --- | --- | --- |
| `email_not_configured` | 500 | Deployment has no `RESEND_API_KEY`. | Add it to the Vercel environment, redeploy. |
| `email_auth_failed` | 500 | Resend rejected the key (401/403): revoked, or a sending key scoped to another domain. | Re-issue the key in Resend, update Vercel. |
| `email_domain_unverified` | 500 | The `from` domain has no verified DNS records in the Resend account. | Verify the domain at resend.com/domains (SPF/DKIM records at the registrar), or point `RESEND_FROM_EMAIL` at a domain that is verified. |
| `email_recipient_restricted` | 500 | Resend sandbox: an unverified account may only email its own owner, so real customers bounce while your own address works. | Same fix — verify the sending domain. |
| `email_invalid_recipient` | 400 | Resend refused the address itself. | Customer-facing; the UI asks them to check the address. |
| `email_rate_limited` | 429 | Throttled. Already retried once automatically. | Usually transient; check the Resend plan limits if it persists. |
| `email_send_failed` | 502 | Anything else, including transport failures and Resend 5xx. Retried once. | Check the logged `providerMessage`. |

The "works for me, fails for customers" shape — you receive the email, everyone
else gets an error — is almost always `email_recipient_restricted` or
`email_domain_unverified`.

## Retries

`lib/email.ts` retries exactly once, 600 ms later, and only for failures a
retry can fix: rate limiting, Resend 5xx, and transport-level throws. A
misconfiguration is never retried — it would just burn the function's 10 s
budget.
