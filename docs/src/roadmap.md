# Architecture roadmap

The existing three-app structure is useful as a mobile template. The following sequence describes the additional work needed if the goal changes from a runnable demonstration to a production commerce service. It is a proposal, not a claim that these services already exist.

## 1. Make the data contract authoritative

Introduce precise money and product versioning, inventory ownership, and a server-side checkout quote. Add migrations and repository tests for both normal and concurrent updates. Keep the UI cart as user intent, but submit only IDs and quantities. The server must recalculate prices, reject unavailable products, and return a revision or quote expiry. Define how English, Chinese, and Japanese catalog content is edited rather than relying on seeded strings.

## 2. Create orders before touching the cart

Add authenticated `POST /orders` with an idempotency key. In one transaction reserve stock and persist order and immutable line snapshots. The response carries the order ID and calculated amount. Only after success should the client remove submitted cart lines. Cover retries, duplicate keys, changed prices, and insufficient stock with service and integration tests. Keep order state `pending_payment` until a provider confirms payment.

## 3. Integrate payment as an asynchronous state machine

A payment attempt belongs to an order and a server-calculated amount. Verify provider webhook signatures and deduplicate events. Mark paid, failed, or expired through explicit transitions; release stock on failure/expiry and avoid a second capture on replay. Build a user-visible order status and recovery flow. Payment implementation requires a chosen provider and its current contract before code is written.

## 4. Replace the demo session

Adopt revocable sessions or signed, rotating credentials with a defined cookie/CSRF policy. Add login throttling, session expiry behavior, server-verified protected mutations, and logout invalidation. Preserve locale and cart preference without treating browser-stored identity as proof of authorization.

## 5. Add a model provider only behind the SSE boundary

Create a server-side provider interface, output and cost limits, usage logs, abort handling, and post-stream error events. Decide whether conversations must persist; if so, add a repository and retention rules. Never render raw model HTML.

## 6. Make operations observable and repeatable

Log `requestId` across the request, repository, payment, and AI paths. Add health/readiness endpoints only when deployment topology is chosen. Exercise migrations on a disposable PostgreSQL instance, then add browser journeys for order creation, retries, language switching, session expiry, and provider errors across the three UI adapters. Publish English docs first and keep Chinese and Japanese pages aligned with every contract change.
