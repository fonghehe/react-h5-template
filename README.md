# React H5 Template

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

A Next.js 16 and React 19 mobile web monorepo with three independently runnable UI apps. Ant Design Mobile, NutUI React, and Arco Mobile share business screens, API contracts, server handlers, and PostgreSQL repositories. The VitePress documentation is English-first, with matching Chinese and Japanese topics.

## What is included

- Three independent Next.js apps with the same product, cart, sign-in, member, mobile Web API example, and AI demo journeys.
- A shared `UiKit` contract and three component-library adapters, so common business screens do not import one concrete UI library.
- A same-origin HTTP client, Zod request validation, an OpenAPI contract, Orval generated clients/MSW helpers, and normalized errors with request IDs.
- PostgreSQL 17 + Drizzle repositories for product and user reads, with bundled demo data when `DATABASE_URL` is absent.
- TanStack Query for remote product state; Zustand for the local cart, session, and language preference; React Hook Form for non-trivial forms.

This is a runnable template, not a production storefront. Checkout confirms a **local simulation** and does not create an order or charge a payment method. The AI endpoint streams a demonstration answer rather than calling a production model. Logout clears the browser token but does not revoke it on the server. See the [architecture roadmap](./docs/src/roadmap.md) before connecting real orders, payments, or sessions.

## Run locally

Requires Node.js 22.18+ and pnpm 11+. Open the repository root, then:

```bash
pnpm install
pnpm dev
```

`pnpm dev` selects one workspace interactively. Direct commands use fixed ports:

| App | Command | URL |
| --- | --- | --- |
| Ant Design Mobile | `pnpm dev:antd` | `http://127.0.0.1:6777/home` |
| NutUI React | `pnpm dev:nutui` | `http://127.0.0.1:6778/home` |
| Arco Mobile | `pnpm dev:arco` | `http://127.0.0.1:6779/home` |
| Documentation | `pnpm dev:docs` | `http://127.0.0.1:6780/react-h5-template/` |

`pnpm dev:all` runs all four. The included `compose.yaml` starts PostgreSQL only; the Next.js apps and VitePress run on the host with these commands. The three app ports are separate browser origins, so their local carts and sessions do not automatically synchronize. In demo mode, use `user / 123456` or `admin / 123456`.

## Use PostgreSQL

Copy `.env.example` to `.env.local`, verify the `DATABASE_URL` points at the intended database, then run:

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm db:setup
pnpm dev:antd
```

`pnpm db:setup` migrates and seeds the database named by `DATABASE_URL`. If the URL is unset, product/user repositories use bundled records. If the URL is set but the database is unavailable, the request fails rather than silently falling back. Set a long unpredictable `AUTH_SECRET` for production; keep it and `DATABASE_URL` out of `NEXT_PUBLIC_*` variables.

## Repository map and documentation

```text
apps/h5-*             Three Next.js app roots and thin API exports
packages/mobile-ui    Shared business screens and provider composition
packages/ui-*         Ant Design Mobile, NutUI, and Arco adapters
packages/api-client   Same-origin fetch, SSE parser, generated clients
packages/contracts    Domain types and Zod request schemas
packages/server       Auth, handlers, repositories, Drizzle schema
packages/stores       Browser session, locale preference, local cart
packages/i18n         Five-language application messages
openapi/              HTTP contract before client generation
drizzle/              Versioned PostgreSQL migration
docs/                 English, Chinese, and Japanese VitePress guides
```

Start with the [English documentation](./docs/src/index.md), [中文文档](./docs/src/zh/index.md), or [日本語ドキュメント](./docs/src/ja/index.md). The detailed guides explain [frontend state](./docs/src/frontend.md), [commerce](./docs/src/commerce.md), [authentication](./docs/src/authentication.md), [AI streaming](./docs/src/ai.md), [API/database](./docs/src/backend.md), [testing](./docs/src/quality.md), [VS Code and Explorer nesting](./docs/src/editor.md), and [deployment](./docs/src/deployment.md). Each language has the same 13 topic paths.

## Checks and generation

```bash
pnpm lint          # Oxfmt, Oxlint, ESLint
pnpm typecheck     # Workspace type checks
pnpm test          # Vitest unit tests
pnpm build         # Three Next.js apps and VitePress
pnpm test:e2e:antd # Playwright mobile journey for one UI app
pnpm api:generate  # OpenAPI -> packages/api-client generated code
pnpm db:generate   # Drizzle schema -> SQL migration
pnpm check         # lint -> typecheck -> test -> build
```

Update `openapi/schema.yaml` before generating clients for contract changes. Run `typecheck` and `build` sequentially because Next.js rewrites `.next/types` during a build. The checked-in [.vscode configuration](./.vscode/settings.json) exposes the same pnpm tasks and separate server/browser debugger entries.
