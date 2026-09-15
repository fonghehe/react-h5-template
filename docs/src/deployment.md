# Builds, deployment topology, and documentation hosting

## Application topology

`pnpm build` produces three **separate** Next.js applications and one VitePress site. A production rollout must choose which app or apps to serve. Each selected app runs its own Next.js server and owns the matching same-origin `/api` handlers; there is no shared standalone API process in this repository. Do not deploy only static page assets and expect the auth, catalog, or SSE endpoints to run. If all three apps are deployed, each needs its own hostname/path routing and server environment, and each creates a database pool when `DATABASE_URL` is set.

For a single app, use `pnpm build:antd`, `pnpm build:nutui`, or `pnpm build:arco`, then the app package's `start` script on the host or chosen runtime. The app scripts currently bind `127.0.0.1` to fixed ports; a container or remote host needs an explicit network/port design before deployment. `compose.yaml` supplies only PostgreSQL 17 for local development, not an app image or reverse proxy. The repo has no app Dockerfile, Kubernetes manifest, readiness endpoint, or production process supervisor.

## Environment and database

Production requires `AUTH_SECRET`. Set `DATABASE_URL` for persistent product/user reads and apply migrations before serving requests. Without it the server uses bundled demo users and products, including documented demo passwords. The current `PGSSL=require` pool option sets `rejectUnauthorized: false`, so do not assume verified server identity; choose a TLS configuration appropriate to the provider. Treat secret rotation, database backup, pool sizing, and logs as deployment responsibilities. The checkout and AI endpoints remain demonstrations, and the signed bearer token is not revocable on logout; do not accept real orders or payments on this build.

## VitePress and GitHub Pages

`pnpm build:docs` builds three locale families into the VitePress output. `docs/.vitepress/config.mts` sets `base: '/react-h5-template/'`. Before the first deployment, open [Settings → Pages](https://github.com/fonghehe/react-h5-template/settings/pages) and select **GitHub Actions** as the source. This enables the Pages site. Artifact upload alone does not enable it: `actions/deploy-pages` returns HTTP 404 when the site is disabled. `actions/configure-pages` prepares the enabled site for the workflow, but its default `GITHUB_TOKEN` cannot perform the one-time enablement. The workflow builds and publishes **documentation only**, not the Next.js application servers.

After changing the source, push a docs/configuration change to `main` or run **Deploy Docs to GitHub Pages → Run workflow**. Check that the `deploy` job succeeds and open `https://fonghehe.github.io/react-h5-template/`; a successful local build or uploaded artifact does not prove the public site is live.

```bash
pnpm build:docs
pnpm --filter @rh5/docs preview
```

The local preview uses port 6780. If the repository name or hosting path changes, update the VitePress base and links before publishing. Keep the English default, `/zh/`, and `/ja/` pages together in each documentation change. The [Roadmap](/roadmap) lists operational work needed before production commerce use.
