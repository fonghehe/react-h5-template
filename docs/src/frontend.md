# Frontend composition

## Three apps, one screen implementation

`apps/h5-antd-mobile`, `apps/h5-nutui`, and `apps/h5-arco-mobile` are separate Next.js applications. Their `src/app` directories own route files, layouts, metadata, and thin API Route Handler exports. A page file normally imports a screen from `packages/mobile-ui` instead of keeping business logic in the page. Each app installs one UI adapter (`packages/ui-antd-mobile`, `packages/ui-nutui`, or `packages/ui-arco-mobile`) and supplies its `UiKit` through `AppProviders`. The shared screen uses `useUi()` to request the adapter's `Button`, `Input`, `TabBar`, loading state, dialog, or toast. A change to a shared screen appears in all three apps; a component-library-specific fix belongs only in its adapter.

| Route | Shared screen or purpose | Main data owner |
| --- | --- | --- |
| `/home` | Landing page and navigation | Local presentation |
| `/products`, `/products/[id]` | Catalog, detail, refresh, pagination | TanStack Query |
| `/cart`, `/checkout` | Selection, quantities, demonstration form | Zustand cart and React Hook Form |
| `/login`, `/member` | Sign-in, profile, locale picker | Zustand session; `/api/user` exists as a separate server check |
| `/ai` | Demonstration streaming conversation | Page-local messages and SSE reader |
| `/examples/*` | Query, request, and mobile Web API patterns | Depends on the example |

The root `/` redirects into the app's mobile route set. The four fixed development ports are documented in [Getting started](/getting-started). Browser storage follows origin rules: a cart at port 6777 is independent of the cart at port 6778 or 6779.

## State ownership

`AppProviders` creates one `QueryClient` per mounted app tree. Its queries use a 30-second stale time, one retry, and no refetch on window focus. Product lists use `useInfiniteQuery` with `['products', locale]`; details use `['product', id, locale]`. Including the locale in the key prevents an English catalog result from being reused as a Japanese result. Query results remain in Query; they are not mirrored into Zustand.

`packages/stores/src/session.ts` stores the selected locale, bearer token, and displayed user. `packages/stores/src/cart.ts` stores selected lines with product snapshots and quantities from 1 to 99. Both stores use Zustand persistence with hydration delayed until the client mounts. This avoids reading browser storage while Next.js renders on the server. Cart totals are selectors over local snapshots, so they are **not authoritative prices** for an order. The detail-page favorite heart is component-local state; it is not a saved favorites API.

## Mobile shell and extension points

`MobileShell` renders the bottom tabs for the main routes and hides them for login, cart, checkout, AI, and detail pages. The shared stylesheet handles safe-area insets, a dynamic viewport, touch-friendly controls, and fixed commerce docks. The mobile examples demonstrate network state, share, clipboard, and capability fallbacks. A new journey should be tested at 320px and with the software keyboard visible if it adds a fixed action area.

To add a new business screen, define its domain/request contract in `packages/contracts` and OpenAPI if it calls the server, implement a reusable screen in `packages/mobile-ui`, add thin page exports in all three apps, and extend the `UiKit` only when all adapters can supply the new capability. Put long-lived server data in Query, local user preference or cart data in Zustand, and form editing state in React Hook Form.
