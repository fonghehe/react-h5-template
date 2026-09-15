# Commerce journey and its boundary

The repository has a runnable browsing-to-checkout journey, but it is a teaching workflow rather than an order-processing system. This distinction matters whenever a new feature touches money, stock, fulfillment, or account history.

## What runs today

1. `/products` requests pages from `/api/products`. The server selects a locale, validates `page` and `pageSize`, and reads from PostgreSQL when `DATABASE_URL` is configured; otherwise it reads bundled records. The list shows loading, error/retry, pull-to-refresh, and infinite-scroll states.
2. `/products/[id]` requests one product. The detail screen can add the product snapshot to the local cart. Its favorite button only changes page-local state.
3. `/cart` uses persisted Zustand lines. A line stores `product`, `quantity`, and `selected`; the UI can adjust quantity, select all, remove a line, and display a subtotal from the snapshot price.
4. `/checkout` validates name, a mainland-China-style mobile number, address, and the single demonstration payment value with React Hook Form and Zod. After a confirmation dialog it removes selected cart lines and navigates to products.

No checkout HTTP request is sent, no order row is stored, and no payment is initiated. The `memberPrice` shown on detail is informational; the cart total uses `price`. The checkout label says "pay" for the demonstration, but the form is not a payment instrument. This page should never be used as evidence of completed order or payment integration.

## Why the current total cannot create an order

A browser line includes a full product snapshot and a client-side price. A user can change browser storage or keep an old price after catalog data changes. Even without tampering, multiple applications have separate carts because they run on different ports. The current database has only `products` and `users`; it has no stock ledger, orders, payment attempts, or delivery address tables. Clearing the cart before a server acknowledges an order would lose a user's selection on failure.

A real order API should accept product IDs, quantities, shipping details, and an idempotency key. In one database transaction it should read current price and stock, reserve inventory, insert an order plus immutable order lines, and return an order ID with a server-calculated total. The client should clear only the submitted lines after that response. Payment initiation and provider webhook verification should be separate stages. A verified webhook changes `pending_payment` to `paid`; a failed or expired payment releases inventory. Duplicate submissions and duplicate webhooks must be safe to replay.

| Future table or service | Responsibility |
| --- | --- |
| `orders` | Owner, status, total in minor currency units, idempotency key, timestamps |
| `order_items` | Product ID, quantity, captured title and unit price at order time |
| `inventory` or stock ledger | Reservable stock and release events |
| `payment_attempts` | Provider reference, amount, status, replay-safe webhook processing |
| Address record | Shipping details protected by access control and retention policy |

Use integer minor units or a precise decimal type for money; the current `price` fields are integers interpreted as yuan in the demo. Do not derive production totals from floating-point UI formatting or from the cart snapshot. The concrete implementation order is tracked in [Roadmap](/roadmap).
