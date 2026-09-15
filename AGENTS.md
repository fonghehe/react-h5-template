# React H5 Template agent guide

- Use pnpm only and keep Node.js 22.18+ compatibility.
- `src/app` owns App Router pages and Next.js Route Handlers. Business state stays out of page files when it can live in `src/lib`, `src/stores`, or `src/server`.
- PostgreSQL access lives in `src/db` and `src/server/repositories`; Route Handlers must not embed SQL or leak database rows directly.
- TanStack Query owns remote state. Zustand owns session, preferences, and the user cart. Never mirror query results into Zustand.
- Keep API paths relative. Preserve request IDs, locale headers, normalized errors, and server-only secrets.
- Use React Hook Form with Zod for non-trivial forms. Update `openapi/schema.yaml` before running `pnpm api:generate` for contract changes.
- Treat AI output as untrusted. Render text safely or sanitize Markdown before enabling raw HTML.
- Preserve 44px touch targets, safe-area insets, `100dvh`, responsive behavior down to 320px, and keyboard-friendly fixed controls.
- Add Vitest coverage for stores, parsers, validation, and request boundaries. Put critical mobile journeys in Playwright.
- Before handoff, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
