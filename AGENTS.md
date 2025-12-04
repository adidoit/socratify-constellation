# Repository Guidelines

## Project Structure & Modules
- Monorepo managed with pnpm/Turborepo. Workspaces: `apps/*` (Next.js apps), `packages/db` (Supabase migrations/types), `packages/supabase` (shared Supabase client).
- Reference app: `apps/template` (clone for new products). Live app: `apps/issue-tree`.
- Supabase migrations live in `packages/db/supabase/migrations`; generated DB types in `packages/db/src/types.ts`.
- Shared Supabase client lives in `packages/supabase/src`.

## Build, Test, and Development Commands
- Install deps: `pnpm install`.
- Dev server (filter per app): `pnpm dev --filter @constellation/issue-tree` (or `@constellation/template`).
- Build all: `pnpm run build` (Turbo). Build per app: `pnpm turbo run build --filter @constellation/issue-tree`.
- Supabase migrations/types (from linked project): `pnpm --filter @constellation/db push`; regenerate types: `pnpm --filter @constellation/db types`; link once: `pnpm --filter @constellation/db link`.
- Issue Tree tests: `pnpm --filter @constellation/issue-tree test` (Jest), `pnpm --filter @constellation/issue-tree test:e2e` (Playwright).

## Coding Style & Naming
- TypeScript/React (App Router). Prefer strict typing; avoid `any`.
- Path aliases: `@/*` inside apps; `@constellation/db` and `@constellation/supabase` across packages.
- Keep formatting consistent with existing code (Next.js ESLint config). Use JSX/TSX with functional components.

## Testing Guidelines
- Unit/integration: Jest in `apps/issue-tree/__tests__`.
- E2E: Playwright in `apps/issue-tree/tests`.
- Run relevant suites before PRs; keep tests colocated (`__tests__` for unit, `tests` for e2e).

## Commit & PR Guidelines
- Use clear, action-oriented commit messages (e.g., “Add Supabase client helpers”, “Migrate issue-tree schema to shared DB”).
- PRs should include: summary of changes, testing performed, and any schema/migration notes. If UI changes, include screenshots when practical.

## Security & Configuration
- Env vars required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (per app/Vercel project). Do not commit `.env*`.
- Supabase schema changes must go through `packages/db/supabase/migrations`; never edit DB via UI without backfilling a migration.
