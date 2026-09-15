# VS Code ワークスペース

リポジトリの **ルート** を VS Code で開くと、pnpm workspace、ローカル TypeScript SDK、タスク、デバッグのパスが一致します。`.vscode` は pnpm コマンドの便利な入口で、CLI の確認を置き換えません。

`settings.json` は `node_modules/typescript/lib` を指定し、Oxc 拡張からローカル Oxfmt を使って保存時に整形します。`.next`、`.turbo`、VitePress の出力とキャッシュは検索・監視から除外します。`extensions.json` は Oxc、ESLint、Tailwind CSS、Playwright、スペルチェックを推奨します。拡張がない場合は `pnpm format` を実行してください。最終判定は Oxfmt、Oxlint、ESLint を実行する `pnpm lint` です。Markdown はリポジトリの formatter 設定で対象外です。

## Explorer のファイル整理

関連ファイルのネストを有効にし、初期状態では折りたたみます。ルートの `README.md` に中国語版と日本語版、ルートの `package.json` に pnpm workspace、lockfile、Turbo 設定をまとめます。各アプリの `next.config.ts` に `next-env.d.ts` と `postcss.config.mjs`、`.vscode/settings.json` にデバッグ、タスク、拡張設定をまとめます。同じディレクトリでは、`*.ts` または `*.tsx` に同名の test/spec だけをネストします。TypeScript 設定の派生ファイルは `tsconfig.json` にまとめます。

Explorer では `.next`、`.turbo`、VitePress の `dist`/`cache`、`coverage`、`node_modules`、Playwright のレポートなどの生成ディレクトリを隠します。これはエディターの表示設定で、ファイルの削除や Git の除外ではありません。生成された API クライアントは契約確認のため Explorer から開けますが、通常の検索からは除外されます。関連ファイルを平らに表示する場合は **Explorer → More Actions → Toggle File Nesting** を使い、生成ディレクトリを表示する場合は workspace の `files.exclude` を変更してください。

**Terminal → Run Task** から 4 つの開発入口、`pnpm check`、単体テスト、モバイル E2E、OpenAPI 生成、DB setup を使えます。DB タスクは `DATABASE_URL` の対象にマイグレーションとデモデータを書きます。実行前に接続先を確認してください。開発タスクは固定ポートと専用ターミナルを占有します。

**Run and Debug** には 3 つの `node-terminal` サーバー入口と対応する Chrome 入口があります。先にサーバーを起動し、`Ready` と URL を確認してからブラウザーを起動します。`packages/server` の Route Handler、`packages/mobile-ui` の共通画面にそれぞれ breakpoint を設定できます。直接 `pnpm dev:*` を呼ぶので対話式 selector は不要です。調査後はサーバーターミナルも止めてポートを解放します。

根拠は [Oxfmt の公式エディター設定](https://oxc.rs/docs/guide/usage/formatter/editors)、[VS Code のファイルネスト](https://code.visualstudio.com/updates/v1_67)、[VS Code デバッグ設定](https://code.visualstudio.com/docs/debugtest/debugging-configuration)です。
