# Getting started

## Requirements and operating modes

Use Node.js 22.18 or newer and pnpm 11 or newer. Install from the repository root. The three Next.js apps have independent servers and browser origins; the fourth workspace is VitePress documentation. PostgreSQL is optional for UI exploration, but needed to exercise the persistent catalog and user repositories.

| Mode | Host processes | Data behavior |
| --- | --- | --- |
| Demo | One chosen Next.js server, optionally VitePress | Bundled products and demo users; cart/session in the browser |
| Database-backed development | Next.js on the host and PostgreSQL 17 in Docker | Product/user reads from PostgreSQL after migrations and seed |
| All-app comparison | Three Next.js servers plus VitePress on the host | Each app has its own same-origin API and browser storage |

The current `compose.yaml` starts **PostgreSQL only**. It does not containerize the three Next.js apps or the documentation site. For a first run:

```bash
pnpm install
pnpm dev
```

`pnpm dev` invokes the `turbo-run` selector and runs one workspace's `dev` script. Select an app with the arrow keys and Enter. To avoid the selector, use one of the direct commands below. The scripts use fixed ports and `--strictPort`/fixed Next.js ports, so an occupied port is an error rather than an automatic fallback.

| App | Direct command | Local URL |
| --- | --- | --- |
| Ant Design Mobile | `pnpm dev:antd` | `http://127.0.0.1:6777/home` |
| NutUI React | `pnpm dev:nutui` | `http://127.0.0.1:6778/home` |
| Arco Mobile | `pnpm dev:arco` | `http://127.0.0.1:6779/home` |
| Documentation | `pnpm dev:docs` | `http://127.0.0.1:6780/react-h5-template/` |

Run `pnpm dev:all` only when comparing all four. The Next.js development and build scripts use webpack; this repository previously observed a Turbopack panic during repeated multi-app restarts. Stop the process with `Ctrl+C` before starting the same app again.

## PostgreSQL setup

Copy `.env.example` to `.env.local` and set a local `DATABASE_URL`. The example URL matches `compose.yaml`. Then start only the database and apply the checked-in migration plus idempotent seed:

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm db:setup
pnpm dev:antd
```

`pnpm db:setup` is `db:migrate` followed by `db:seed`; it modifies the database named by `DATABASE_URL`. The seed upserts demo products and users, so repeating it refreshes those records. If a local PostgreSQL already uses port 5432, change the Compose host port and the URL together. To return to demo repository behavior, unset `DATABASE_URL` for the Next.js process; do not point it at an unavailable server, because a configured but unreachable database is an error rather than a silent fallback.

Development demo credentials are `user / 123456` and `admin / 123456`. In production the signing key `AUTH_SECRET` is mandatory. `PGSSL=require` is available for a TLS-requiring database provider; the current pool configuration disables certificate verification in that mode, so choose and review a secure provider-specific TLS policy before deployment.

## First verification and common failures

Open `/products`, add an item, visit `/cart`, and switch language in `/member`. To inspect the HTTP contract directly, request a page from the selected app's same-origin API:

```bash
curl -H 'Accept-Language: en-US' 'http://127.0.0.1:6777/api/products?page=1&pageSize=2'
```

A valid response contains `code: 0`, a `data` page, and `requestId`. Invalid page values return a localized 400 envelope. `/api/ai/chat` returns SSE only for a valid message array; input errors are JSON before streaming starts.

If a port is occupied, stop the process already listening on that port. If database reads fail, check that Docker's PostgreSQL health check passed, the URL matches the exposed host port, and `pnpm db:setup` ran against the same database. If editor diagnostics differ from CLI checks, use the workspace TypeScript SDK and [VS Code setup](/editor). The checkout remains a local simulation; [Commerce](/commerce) explains that boundary.
