# API boundary and PostgreSQL backend

## Route ownership and request lifecycle

Each app defines the same set of `src/app/api` Route Handler files. These are thin exports of functions from `packages/server/src/routes`; they do not embed SQL. A normal product request follows this path:

```text
shared screen → packages/api-client → same-origin /api/products
→ app Route Handler export → packages/server request validation
→ packages/server repository → bundled data or PostgreSQL
→ { code, data, message, requestId }
```

The `packages/contracts` Zod schemas validate pagination, product IDs, login payloads, and AI message arrays at the server boundary. A page number must be an integer between 1 and 10,000, and `pageSize` between 1 and 20. An invalid product ID is a 400; a valid ID with no product is a 404. Login failure is 403; a missing/invalid `/api/user` bearer token is 401. The client throws `ApiError` for nonzero codes, HTTP errors, network failures, or a malformed envelope.

| Method and path | Current behavior | Auth |
| --- | --- | --- |
| `GET /api/products` | Locale-aware page of products | None |
| `GET /api/products/{id}` | One product or 404 | None |
| `POST /api/auth/login` | Demo/DB credential check and signed token | None |
| `POST /api/auth/logout` | Success envelope; client clears token | No server revocation |
| `GET /api/user` | Verify bearer signature/expiry and load public user | Bearer |
| `POST /api/ai/chat` | Demo SSE stream or pre-stream JSON 400 | None |

The API client only accepts `/api/` relative paths, sets `Accept-Language`, and creates `X-Request-ID`. The server accepts a UUID request ID or creates one, and returns it in JSON envelopes or the SSE `start` event. The server chooses the highest-weight supported language from `Accept-Language`; unsupported languages fall back to Simplified Chinese. Translated `message` is for display, while numeric `code` and HTTP status remain the machine-readable error boundary. Server logging does not yet correlate this ID across operations; that is a roadmap item.

## API specification and generated code

`openapi/schema.yaml` is the public contract. Update it **before** running `pnpm api:generate`; Orval writes generated React Query code and MSW helpers into `packages/api-client/src/generated/generated`. The custom `api` wrapper and `consumeSseChunk` remain the currently used runtime paths for shared screens. The generated chat mutation describes a text/event-stream response, but the interactive chat page deliberately uses a streaming reader instead of treating the response as a single JSON object. Review generated diffs after contract changes.

A contract update needs both the schema and the Route Handler implementation. Add request-boundary tests for invalid input and an HTTP smoke check for content type, code, locale, and request ID. Do not expose database rows directly: `packages/server/src/repositories/catalog.ts` maps rows to `Product` fields and selects the title by locale.

## Database selection and schema

`getDatabase()` returns `null` when `DATABASE_URL` is unset. Repository functions then read bundled data. When the URL is present, `getDatabase()` creates a shared `pg.Pool` and Drizzle client; failures in that configured database surface as errors. The pool's development maximum is five connections per Next.js process, and production maximum is ten. Running all three apps means separate server processes and therefore separate pools. Plan connection capacity accordingly.

`products` stores three title columns (`title_zh`, `title_en`, `title_ja`), image URL, integer demo price and member price, shop/delivery/description fields, sort order, and timestamps. `users` stores username, salted password hash, public profile fields, roles, and timestamps. `drizzle/` contains a checked-in SQL migration; `scripts/db-seed.ts` upserts the demonstration records and resets serial sequences. The current product description/shop fields are not fully localized in the database. No orders, inventory, sessions, or conversation tables exist. Their proposed boundaries are in [Commerce](/commerce), [Authentication](/authentication), and [Roadmap](/roadmap).
