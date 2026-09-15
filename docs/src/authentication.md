# Authentication and session lifecycle

## Demonstration flow

`/login` is a React Hook Form screen validated by `loginSchema`. It sends a same-origin JSON request to `/api/auth/login`. The shared handler validates again on the server and calls `authenticateUser`. In demo mode this checks the bundled account records. In PostgreSQL mode the repository loads the user and verifies a salted `scrypt` password hash. The response returns public user fields and a signed bearer token. The token contains a user ID and seven-day expiry and is signed with HMAC-SHA256 using `AUTH_SECRET`.

The session store persists `token`, `user`, and locale in browser storage. An authenticated request, such as `/api/user`, sends `Authorization: Bearer <token>`. The server checks the signature and expiry, then loads a public user from the active repository. This check does not consult the user object cached in the browser. The member screen currently displays its persisted user from Zustand; that display alone is not proof that the server token is still valid.

`/api/auth/logout` currently returns a success envelope without server-side revocation. The member screen calls it and clears the local token and user even if the call fails. A copied token remains valid until expiry. The current design is a demonstration session, not a production logout guarantee. The login screen's redirect helper accepts same-site paths beginning with `/` and rejects `//` protocol-relative paths.

## Secrets and production design

In development, a local fallback signing secret lets the demo run. In production, `AUTH_SECRET` is required. Keep it server-side and do not use `NEXT_PUBLIC_*`. `DATABASE_URL` is also server-side. The demo accounts and passwords are intentionally documented for local exploration; remove or replace them in a real deployment.

A production session change requires an explicit policy, rather than only moving the token into a cookie. Define session lifetime, refresh or rotation, server revocation, device handling, and response behavior on expiration. If using an HttpOnly cookie, specify `Secure`, `SameSite`, path, and CSRF protection for state-changing requests. Add login rate limiting and audit records. Update OpenAPI and request tests when changing the transport because `/api/user` currently expects a bearer header. The cart and locale may remain local preferences, while the authenticated identity must be verified by the server on protected actions.
