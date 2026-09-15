# VS Code workspace setup

The checked-in `.vscode` directory is a convenience layer over the repository's pnpm scripts. It does not replace the CLI checks. Open the **repository root** in VS Code so the local TypeScript SDK, workspace packages, tasks, and debug paths resolve correctly.

## Editor behavior and extensions

`settings.json` selects the workspace TypeScript installation and the Oxc formatter, enables format on save, uses the root ESLint working directory, and keeps generated/build output out of search and file watching. The formatter is the same local Oxfmt tool used by `pnpm format:check`; Markdown is ignored by the repo's formatter configuration. `extensions.json` recommends Oxc, ESLint, Tailwind CSS IntelliSense, Playwright, and a spell checker. These are suggestions; the app and checks run without installing editor extensions.

If the Oxc extension is not installed, VS Code may not format on save. Install the recommended extension or run `pnpm format` explicitly. `pnpm lint` is the final authority because it also executes Oxlint and ESLint. TypeScript should use `node_modules/typescript/lib` from the repo rather than the editor's bundled version.

## Explorer organization

File nesting is enabled with related files collapsed by default. The root `README.md` groups its Chinese and Japanese counterparts; the root `package.json` groups the pnpm workspace, lockfile, and Turbo configuration. Each app's `next.config.ts` groups `next-env.d.ts` and `postcss.config.mjs`; `.vscode/settings.json` groups the launch, task, and extension files. A `*.ts` or `*.tsx` file groups only a test or spec with the same basename in the same directory. TypeScript configuration variants are grouped under `tsconfig.json`.

Explorer hides generated build output and dependency directories (`.next`, `.turbo`, VitePress `dist`/`cache`, `coverage`, `node_modules`, and Playwright reports). This is an editor view setting, not a deletion or Git ignore rule. The generated API client remains visible in Explorer for contract inspection, although it is excluded from ordinary search. Use **Explorer → More Actions → Toggle File Nesting** if you need a flat view of related files; reveal excluded directories by changing `files.exclude` in workspace settings.

## Tasks and debugging

Run **Terminal → Run Task** for direct app development tasks, `pnpm check`, unit tests, E2E, OpenAPI generation, or database setup. The database task requires a valid `DATABASE_URL`; it migrates and seeds the configured database. The four development tasks use fixed ports and occupy their dedicated terminal until stopped. Do not start the same app twice on its port.

Run and Debug contains three `node-terminal` server entries and three Chrome browser entries. First start a server entry, wait for its printed `Ready` URL, and then start the matching browser entry. Set breakpoints in `packages/server` for Route Handler logic or `packages/mobile-ui` for client code. The browser entries use the corresponding app's `webRoot`; the server entries invoke the direct `pnpm dev:*` command to bypass the interactive selector. A full-stack bug often needs both sessions. Stop the server from the debug panel or its terminal after the investigation.

The local Next.js version documents `node-terminal` debugging and a `cwd` adjustment for monorepos. The checked-in configuration follows that shape while retaining this repository's fixed ports and pnpm-only commands.

For the editor-specific behavior, see the [official Oxfmt editor setup](https://oxc.rs/docs/guide/usage/formatter/editors), [VS Code file nesting reference](https://code.visualstudio.com/updates/v1_67), and [VS Code debug configuration guide](https://code.visualstudio.com/docs/debugtest/debugging-configuration).
