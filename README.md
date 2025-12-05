# Socratify Constellation Platform (Supabase + Next.js Monorepo)

This repo is a small monorepo that hosts multiple product‑specific Next.js apps powered by a single Supabase project (`socratify-constellation`).

- One **Supabase project** for Auth + Postgres + RLS.
- Multiple **Next.js apps**, each deployed as its own Vercel project and domain.
- Shared **database schema, migrations, types** and a **Supabase client** package.

The goal is to make it easy to add new apps over time while keeping schema and auth centralized.

---

## Stack

- **Runtime**: Node.js / TypeScript
- **Frontend**: Next.js (App Router)
- **Backend‑as‑a‑Service**: Supabase (Auth + Postgres + RLS)
- **Monorepo tooling**: pnpm + Turborepo
- **Deployments**: Vercel (one project per app)

---

## Repository Layout

```text
.
├─ apps/
│  ├─ template/        # Example Next.js app wired to shared Supabase
│  └─ issue-tree/      # Real app migrated into the monorepo
├─ packages/
│  ├─ db/              # Supabase migrations + generated DB types
│  └─ supabase/        # Shared Supabase client creators (browser + server)
├─ package.json        # Workspace scripts (turbo)
├─ pnpm-workspace.yaml # Workspace configuration
├─ turbo.json          # Turborepo pipeline
└─ tsconfig.base.json  # Shared TS config + path aliases
```

`apps/template` is a reference Next.js app wired to the shared Supabase client/types. For real apps you will clone this folder and customize.
`apps/issue-tree` is an existing product that has been moved into the monorepo and wired to the shared Supabase client/types.

---

## Supabase Setup

Single Supabase project: **`socratify-constellation`**

From the Supabase dashboard, you need:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server‑side / CI only)

### Database Schema & Migrations

All schema is managed via `packages/db`:

- Supabase CLI config: `packages/db/supabase/config.toml`
- Migrations: `packages/db/supabase/migrations/*.sql`
- Generated DB types: `packages/db/src/types.ts`

Initial schema includes:

- `apps` – registry of products (`slug`, `domain`, etc.)
- `profiles` – per‑user profile tied to `auth.users`
- `user_apps` – user ↔ app membership and roles
- `subscriptions` – app‑scoped subscription records
- `issue_tree_cases`, `phonescreen_questions` – examples of app‑specific tables

> Rule: all schema changes must go through migrations in `packages/db/supabase/migrations`. Avoid manual edits in the Supabase UI except emergencies, and backfill those as migrations afterward.

### Generating Types

`packages/db/src/types.ts` is generated from Supabase. Helper scripts are defined in `packages/db/package.json`:

- `pnpm --filter @constellation/db link` – link CLI to the project ref (run once per machine after `supabase login`)
- `pnpm --filter @constellation/db push` – apply migrations to the linked project
- `pnpm --filter @constellation/db types` – regenerate `src/types.ts` from the linked project

`Database` is exported via `packages/db/src/index.ts` for app/client use.

---

## Shared Supabase Client Package

`packages/supabase` provides framework‑agnostic client creators using `@supabase/ssr`:

- `createSupabaseBrowserClient()` – for client components
- `createSupabaseServerClient({ cookies, headers })` – for App Router server components

Usage inside an app:

```ts
// apps/<app-name>/lib/supabaseServer.ts
import { cookies, headers } from 'next/headers';
import { createSupabaseServerClient } from '@constellation/supabase';

export function getSupabaseServerClient() {
  return createSupabaseServerClient({ cookies, headers });
}
```

```ts
// apps/<app-name>/lib/supabaseBrowser.ts
'use client';
import { createSupabaseBrowserClient } from '@constellation/supabase';

export const supabaseBrowser = createSupabaseBrowserClient();
```

These rely on:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

being set in the environment.

---

## Local Development

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment variables**

   At the repo root (or per app), create a `.env.local` with:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
   SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
   ```

   For local dev, all apps can share these values; they point at the same Supabase project.

3. **Run an app**

   From the repo root:

   ```bash
   pnpm dev --filter @constellation/template
   ```

   Or change the filter to target a specific app once you’ve added more.

4. **Apply migrations (dev)**

   How exactly you run migrations depends on your Supabase CLI setup, but in general you work from `packages/db`:

   ```bash
   pnpm --filter @constellation/db push   # applies migrations to the linked project
   ```

   To (re)link the CLI to the correct project, run once:

   ```bash
   pnpm --filter @constellation/db link
   ```

---

## E2E (Playwright) Pattern for Any App

Every app can share the same Playwright scaffolding via `@constellation/test-utils`. This keeps auth/setup consistent across 20+ apps.

1. **Copy the config + setup**
   - Create `apps/<app>/playwright.config.ts`:
     ```ts
     import { createPlaywrightConfig } from "@constellation/test-utils/playwright";
     const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000"; // adjust port
     export default createPlaywrightConfig({
       testDir: "./tests",
       baseURL: BASE_URL,
       storageState: "storageState.json",
       globalSetup: "./tests/global-setup.ts",
       envFile: "../../.env.test",
       webServerCommand: "pnpm dev --hostname 127.0.0.1 --port 3000", // match app port
       webServerUrl: BASE_URL,
     });
     ```
   - Add `apps/<app>/tests/global-setup.ts`:
     ```ts
     import { chromium, type FullConfig } from "@playwright/test";
     import { loginWithMagicLink } from "@constellation/test-utils/playwright";

     const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
     const REDIRECT_URL =
       process.env.PLAYWRIGHT_REDIRECT_URL || `${BASE_URL.replace(/\/$/, "")}/auth/callback?next=/`;
     const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || "testuser@example.com";

     export default async function globalSetup(_config: FullConfig) {
       const browser = await chromium.launch();
       const page = await browser.newPage();
       await loginWithMagicLink(page, {
         email: TEST_EMAIL,
         redirectTo: REDIRECT_URL,
         waitForPathContains: "/auth/callback",
         baseUrl: BASE_URL,
       });
       await page.context().storageState({ path: "storageState.json" });
       await browser.close();
     }
     ```
   - Write tests in `apps/<app>/tests/*.spec.ts` that assume `storageState.json` already has an authenticated user.

2. **Env for tests** (`.env.test` in repo root; copy from `.env.test.example`)
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ENABLE_TEST_AUTH_ENDPOINT=true
   E2E_BYPASS_PROXY=true
   E2E_SKIP_GEMINI=true          # lets tests stub AI calls
   NEXT_PUBLIC_E2E_TEST_MODE=true # allow test-only UI shortcuts
   ```
   - `SUPABASE_SERVICE_ROLE_KEY` is only for test setup to mint magic links.
   - Keep `.env.test` out of git.

3. **Auth/session helper endpoint (App Router)**
   - Add `app/api/test/set-session/route.ts` that calls `supabase.auth.setSession` using the posted tokens.
   - Guard it with `ENABLE_TEST_AUTH_ENDPOINT` and disable in production.
   - The shared `loginWithMagicLink` hydrates cookies/localStorage; the endpoint is a fallback for SSR auth.

4. **Run tests per app**
   ```bash
   pnpm --filter @constellation/<app> test:e2e
   ```

5. **Authoring tests**
   - Prefer UI-driven flows; you already start authenticated.
   - For slow/external APIs, gate with envs (e.g., `E2E_SKIP_GEMINI`) and return a dummy response in the route handler during tests.
   - If an app needs to bypass middleware/proxy in tests, honor `E2E_BYPASS_PROXY`.

This pattern is already implemented in `apps/issue-tree` and `apps/whiteboard`; copy/adapt for new apps (update ports/paths as needed).

---

## Adding a New App

Adding a new app (e.g. `issue-tree`) involves four steps:

1. **Clone the template app**

   ```bash
   cp -R apps/template apps/issue-tree
   ```

2. **Update app metadata**

   - In `apps/issue-tree/package.json`, update:

     ```json
     {
       "name": "@constellation/issue-tree"
     }
     ```

   - In `apps/issue-tree/config/app.ts`, set:

     ```ts
     export const APP_SLUG = 'issue-tree';
     export const APP_DOMAIN = 'issue-tree.ai';
     ```

   - Update titles/descriptions in `app/layout.tsx` and any copy in `app/page.tsx` as needed.

3. **Register the app in the DB**

   Insert a row into the `apps` table in Supabase:

   ```sql
   insert into public.apps (slug, domain)
   values ('issue-tree', 'issue-tree.ai');
   ```

   You can do this via the Supabase SQL editor or a migration, depending on your preference.

4. **(Optional) App‑specific schema**

   If the new app needs its own tables, add a migration in `packages/db/supabase/migrations`, e.g.:

   ```sql
   create table public.issue_tree_cases (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null references auth.users(id) on delete cascade,
     created_at timestamptz not null default now()
   );

   alter table public.issue_tree_cases enable row level security;

   create policy "User owns issue tree cases"
   on public.issue_tree_cases
   for all
   using (user_id = auth.uid());
   ```

   Then apply the migration and regenerate types as described above.

---

## Vercel Setup

Each app gets its own Vercel project, all pointing at the same GitHub repo.

### 1. Create Environment Group
If your Vercel plan supports Environment Groups, create one (e.g. `constellation-supabase`) with:

- `NEXT_PUBLIC_SUPABASE_URL = <SUPABASE_URL>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY = <SUPABASE_ANON_KEY>`
- `SUPABASE_SERVICE_ROLE_KEY = <SUPABASE_SERVICE_ROLE_KEY>`

If groups are not available, add these three variables directly to each project’s Environment Variables for all environments you use (Production/Preview/Development).

### 2. Create a Vercel Project per App

For each app (e.g. `issue-tree`):

1. **Import** the GitHub repo `adidoit/socratify-constellation` into Vercel.
2. In **Project Settings → General**:
   - Set **Root Directory** to `apps/issue-tree`.
3. In **Settings → Environment Variables**:
   - Attach the `constellation-supabase` environment group.
4. In **Domains**, add:
   - `issue-tree.ai`
   - Any preview domains you need.

Vercel will:

- Clone the repo.
- Run `pnpm install` (workspace aware).
- Run `pnpm run build` in the app root (Next.js build).
- Deploy it at the configured domain.

Repeat this process for each app (`phonescreenprep`, `fitinterview`, `caseinterviewprep`, etc.) pointing to their respective `apps/<app-name>` root directories.

### 3. Supabase Auth Redirect URLs

In the Supabase dashboard, under **Authentication → URL Configuration**, add redirect URLs for each app:

- `https://issue-tree.ai/auth/callback`
- `https://phonescreenprep.com/auth/callback`
- `https://fitinterview.ai/auth/callback`
- `https://caseinterviewprep.org/auth/callback`

Also include Vercel preview URLs if you’ll be testing auth there.

Each app implements its own `/auth/callback` route (see `apps/template/app/auth/callback/page.tsx`) to process Supabase auth flows.

---

## Git & Workflow

This directory is its own Git repository, with origin:

- `https://github.com/adidoit/socratify-constellation`

Typical workflow:

1. Make schema changes in `packages/db/supabase/migrations`.
2. Apply migrations to your dev environment.
3. Regenerate types in `packages/db/src/types.ts`.
4. Add or update apps under `apps/*`.
5. Commit and push changes.
6. Vercel builds and deploys each app project that points to this repo.

---

## Notes & Future Extensions

- You can add a central login / portal app (e.g. `apps/portal`) using the same pattern and `apps` table.
- If you later need external multi‑tenant support, you can introduce a `tenant_id` pattern while keeping the single Supabase project.
- Shared analytics or events tables can be keyed by `app_id` and reused across all apps. 

The core idea is: one Supabase project, one migration pipeline, many independent Next.js apps and Vercel projects sharing auth and data in a controlled, type‑safe way.
