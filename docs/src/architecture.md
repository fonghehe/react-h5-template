# Architecture and improvement roadmap

```text
apps/h5-*/src/app       Next.js pages and thin API Route Handler exports
packages/mobile-ui     Shared screens, provider composition, UiKit contract
packages/ui-*          Three concrete mobile component adapters
packages/api-client    Relative-path fetch client, SSE parser, generated API
packages/contracts     Domain types and Zod request schemas
packages/server        Request handling, auth, repositories, database schema
packages/stores        Zustand session and local cart
packages/i18n          Five-language application messages
openapi/               Public HTTP contract
```

The dependency direction is `app → shared screen → API client/contracts/stores`; the three adapters are injected at the app entry point. API exports delegate to `packages/server`, where route functions validate input and repositories select bundled demo data or PostgreSQL. Pages do not contain SQL. TanStack Query caches product reads by locale; the cart and session stay in Zustand and are persisted in browser storage. The three apps have separate browser origins and therefore separate local carts and sessions.

## Request lifecycle

A product request starts in a shared screen, goes through the same-origin API client with `Accept-Language` and `X-Request-ID`, reaches a thin app Route Handler, then passes server validation before a repository query. The response is an `{ code, data, message, requestId }` envelope. Invalid page numbers and product IDs return a localized `400` envelope instead of being silently coerced. The server selects the best supported language from weighted `Accept-Language` values and accepts only UUID request IDs.

The AI endpoint validates the message array before sending SSE bytes. Once streaming starts, HTTP status cannot change; a real provider integration must report subsequent failures as structured SSE events. The current endpoint generates a deterministic demonstration answer and does not persist conversation history.

## Current capability and next steps

| Area | Implemented now | Needed for production business use |
| --- | --- | --- |
| Catalog | Read from PostgreSQL or bundled demo records; locale-specific title columns | Content management, inventory, and versioned prices |
| Cart | Persisted per browser origin; product snapshots and client-side totals | Re-fetch current products and compute prices on the server |
| Checkout | Validated local form, confirmation, then cart clear | Authenticated order API, server-calculated total, idempotency key, transactional stock reservation, payment provider webhook, order states |
| Auth | Signed bearer token in browser storage, seven-day expiry; `/logout` clears client state | Revocable sessions, secure cookie policy, CSRF strategy, refresh/rotation, rate limits |
| AI | Demo SSE events (`start`, `delta`, `finish`) | Provider adapter, cost limits, abuse controls, post-stream error events, persistence only if required |
| Localization | Five application languages; English, Chinese, Japanese docs | Translate DB-managed catalog fields and editorial review |

The first commerce boundary to implement is an order creation service. It should accept product IDs and quantities, query authoritative prices in one transaction, reserve stock, store the order with a unique idempotency key, and only then let the client clear selected cart lines. A payment method must remain in a pending state until a verified provider webhook marks the order paid. No client-supplied price should be treated as authoritative.

## Module boundaries in practice

The page directories own route shape and metadata, while `packages/mobile-ui` owns reusable screen behavior. The `UiKit` contract is deliberately small: if a new screen needs a component-specific API, implement a shared capability or keep that feature in one app instead of importing a concrete library into a common screen. `packages/contracts` is usable by client and server, so it must not import PostgreSQL or secrets. `packages/server` is server-only; repositories map database rows to public domain objects before handlers return them.

The generated Orval client and the custom `api` wrapper serve different roles today. Orval proves the OpenAPI schema can generate typed React Query and MSW artifacts. Shared screens currently call the custom same-origin wrapper, which enforces request ID and locale headers and normalizes API envelopes. A contract change should update both where applicable. AI streaming deliberately uses a separate fetch/read loop because an SSE response is a sequence of events, not a single JSON envelope.

## Walk through a failure

Suppose `/products?page=1junk` reaches an app. The thin Route Handler delegates to the shared products handler. `productPageSchema` rejects the query before repository access. `fail()` returns HTTP 400 with a localized message and a UUID `requestId`. The custom API client turns a nonzero envelope into `ApiError`; a shared screen can show its error state and retry. If the server instead returns HTML (for example from a reverse proxy), the client raises `Invalid API response` and keeps its locally generated request ID. This boundary keeps UI screens from parsing every failure shape independently.

For a valid product ID, the repository selects database or demo mode based solely on the presence of `DATABASE_URL`. A configured but unreachable database is surfaced as a failure; it does not silently revert to demo content. With three deployed apps, their separate Node processes also mean separate database pools and independent browser session/cart storage. These facts affect capacity planning and user-experience decisions before production deployment.

The detailed guides are [Frontend](/frontend), [Commerce](/commerce), [Authentication](/authentication), [AI streaming](/ai), and [Backend](/backend). [Roadmap](/roadmap) orders the proposed changes without presenting them as completed services.
