# @constellation/ui

Shared UI components for Constellation apps.

## Storybook

- Run locally: `pnpm --filter @constellation/ui storybook`
- Build static bundle: `pnpm --filter @constellation/ui storybook:build`

Notes:
- Storybook inherits design tokens and Tailwind config from this package; global styles come from `apps/issue-tree/app/globals.css`.
- Supabase calls are mocked via `.storybook/mocks/supabase.ts` for isolated auth flows. Use the provided controls to toggle states in stories.
- Socratify branding block is exposed as `<SocratifyBranding>` and reused inside the MagicLink modal; configure UTM source via props.
