# @constellation/test-utils

Shared helpers for Playwright + Supabase magic-link auth across apps.

## Environment

Set in `.env.test` (or CI secrets):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `PLAYWRIGHT_TEST_EMAIL`, `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_REDIRECT_URL`

## Helpers

- `getMagicLinkFor(email, redirectTo?)` / `ensureTestUser(email?)` (Node-only)
- Playwright helpers:
  - `createPlaywrightConfig(opts)` to build per-app configs
  - `loginWithMagicLink(page, opts)` to sign in via Supabase action links

Remember: this package is Node-only; do not import into client bundles.
