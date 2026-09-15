# Quality, testing, and change workflow

The required local handoff checks are `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. `pnpm check` executes these in sequence. Each command covers a different failure class; a passing unit test does not prove a Next.js production build, and a build does not prove a mobile journey.

Run `typecheck` and `build` **sequentially**, not at the same time. Next.js rewrites `.next/types` during a build; a concurrent TypeScript process can see a stale file list and report temporary TS6053 missing-file errors. `pnpm check` already orders the two commands safely. If this occurs, wait for the build to finish and rerun `pnpm typecheck` before treating it as a source error.

| Command | Scope |
| --- | --- |
| `pnpm format:check` | Oxfmt consistency for supported source/config files; Markdown is ignored |
| `pnpm lint` | Formatting, type-aware Oxlint, and Next/React ESLint |
| `pnpm typecheck` | Workspace package type checks through Turbo |
| `pnpm test` | Vitest stores, schemas, SSE parser, API and HTTP request boundaries |
| `pnpm build` | All three Next.js production builds plus VitePress |
| `pnpm test:e2e:*` | Playwright core mobile flows for a chosen app |

`playwright.config.ts` selects a port using `E2E_APP`, defaults to Ant Design Mobile, and starts that app as a web server if it is not already running. The browser project uses a Pixel 7-sized Chrome channel. The current E2E suite covers browse/add/cart, 320px horizontal overflow, and language-picker opening. It does **not** yet cover a persisted order, payment, server session revocation, PostgreSQL integration, or AI provider failures. Those services do not exist, so tests must be added with the implementation rather than suggesting current coverage.

Vitest files live near packages in `src/__tests__`; the suite is intentionally small and tests state, parsing, validation, and request boundaries. For a new API request, test acceptance and rejection, then check one actual running Route Handler response. For a store change, test transitions and persisted assumptions. For a critical mobile route, add a Playwright journey and exercise the 320px viewport, safe-area dock, and software-keyboard interaction where applicable.

## Contract and migration changes

1. Update `openapi/schema.yaml`, then run `pnpm api:generate`; review the generated package diff. Generated code is not hand-edited.
2. Update Zod schemas in `packages/contracts`, server handler behavior in `packages/server`, and any custom API client method. Keep request IDs and locale/error envelopes intact.
3. For schema changes, edit `packages/server/src/db/schema.ts`, run `pnpm db:generate`, inspect the SQL migration, and test `pnpm db:migrate` against a disposable PostgreSQL database.
4. Update the English documentation and matching Chinese/Japanese pages, then run `pnpm build:docs` and all required checks.

The checked-in VS Code tasks expose `pnpm check` and focused test commands, but the pnpm scripts remain the source of truth. See [VS Code](/editor) for debugger and editor setup.
