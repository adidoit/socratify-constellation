# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Constellation is a pnpm + Turborepo monorepo hosting multiple Next.js apps powered by a single Supabase project. One Supabase project provides Auth + Postgres + RLS, while multiple Next.js apps are deployed as separate Vercel projects.

## Common Commands

### Root-level (all packages)
```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages (via Turborepo)
pnpm dev                  # Start all apps in dev mode
pnpm lint                 # Lint all packages
pnpm test                 # Run tests in all packages
pnpm typecheck            # Run TypeScript type checking on all packages
```

### Target specific app/package
```bash
pnpm dev --filter @constellation/issue-tree      # Dev server for issue-tree app
pnpm build --filter @constellation/template      # Build only template app
pnpm test --filter @constellation/issue-tree     # Run tests for issue-tree
```

### Database operations (from packages/db)
```bash
pnpm --filter @constellation/db link    # Link Supabase CLI to project (run once)
pnpm --filter @constellation/db push    # Apply migrations to Supabase
pnpm --filter @constellation/db types   # Regenerate TypeScript types from schema
```

### Issue-tree app specific
```bash
cd apps/issue-tree
pnpm test                 # Run Jest unit tests
pnpm test:e2e             # Run Playwright E2E tests
```

## Architecture

### Workspace Structure
```
apps/
  template/       # Reference Next.js 14 app (clone for new apps)
  issue-tree/     # Production app - Next.js 16, React 19, AI SDK
packages/
  db/             # Supabase migrations + generated Database types
  supabase/       # Shared Supabase client creators (browser + server)
```

### Package Dependencies
- `@constellation/db` exports `Database` type generated from Supabase schema
- `@constellation/supabase` provides typed client creators, depends on `@constellation/db`
- Apps import from workspace packages: `@constellation/supabase`, `@constellation/db`

### Database Type Flow
1. Schema changes go in `packages/db/supabase/migrations/*.sql`
2. Run `pnpm --filter @constellation/db push` to apply migrations
3. Run `pnpm --filter @constellation/db types` to regenerate `packages/db/src/types.ts`
4. Apps get typed Supabase clients via the `Database` generic

### Supabase Client Pattern

For Next.js apps using async `cookies()` (Next.js 15+), create a properly-typed client in lib files:

```typescript
// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name) { return cookieStore.get(name)?.value; },
      set(name, value, options) { cookieStore.set(name, value, options); },
      remove(name, options) { cookieStore.delete(name); }
    }
  });
}
```

### App-local Database Types

Each app can define local type helpers in `lib/supabase/database.types.ts`:

```typescript
import type { Database as SharedDatabase } from "@constellation/db";
export type Database = SharedDatabase;

// Conversion helpers for snake_case → camelCase
export function toIssueTree(row: Database["public"]["Tables"]["issue_trees"]["Row"]): IssueTree { ... }
```

### JSON Fields and Type Casting

Supabase `Json` type doesn't match app-specific types. Cast with `as unknown as`:

```typescript
// Inserting
.insert({ tree_json: treeJson as unknown as Database["public"]["Tables"]["issue_trees"]["Insert"]["tree_json"] })

// Reading
const parsed = row.tree_json as unknown as IssueTreeJson;
```

## Environment Variables

Required for all apps:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Server-side only:
```
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Key Differences Between Apps

| App | Next.js | React | Notes |
|-----|---------|-------|-------|
| template | 14 | 18 | Reference/starter app |
| issue-tree | 16 | 19 | Production app with AI SDK, async cookies() |

## Adding a New App

1. Copy `apps/template` to `apps/<new-app>`
2. Update `package.json` name to `@constellation/<new-app>`
3. Update `config/app.ts` with app slug and domain
4. Register app in `apps` table in Supabase
5. Add app-specific tables via migrations if needed

## Code Quality Requirements

**IMPORTANT:** After making any code changes, you MUST run the following checks:

```bash
pnpm typecheck            # Verify no TypeScript errors
pnpm lint                 # Verify no linting errors
```

For a specific app:
```bash
pnpm --filter @constellation/issue-tree typecheck
pnpm --filter @constellation/issue-tree lint
```

These checks are mandatory before considering any task complete. Do not skip them.
