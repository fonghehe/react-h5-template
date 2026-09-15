# 品質確認、テスト、変更手順

引き渡し前のチェックは `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。`pnpm check` は順番に実行します。単体テストが通っても Next.js 本番ビルドやモバイル操作が成功したとは言えません。

`typecheck` と `build` は**同時実行せず順番に**行います。Next.js build が `.next/types` を書き換える間に TypeScript が古いファイル一覧を読むと、一時的な TS6053 missing-file エラーになる場合があります。`pnpm check` は安全な順序です。このエラーが出たら build の完了を待ち、`pnpm typecheck` を再実行してからソースの障害か判断します。

| コマンド | 対象 |
| --- | --- |
| `pnpm format:check` | Oxfmt によるソース/設定の整形確認。Markdown は除外 |
| `pnpm lint` | 整形、型を使う Oxlint、Next/React ESLint |
| `pnpm typecheck` | Turbo の各 workspace 型検査 |
| `pnpm test` | Zustand、Zod、SSE、API/HTTP 境界の Vitest |
| `pnpm build` | 3 Next.js アプリと VitePress の本番ビルド |
| `pnpm test:e2e:*` | 選んだアプリの Playwright モバイル操作 |

`playwright.config.ts` は `E2E_APP` で 6777/6778/6779 を選び、既定は Ant Design Mobile。既存サーバーがなければ Playwright が起動し、Pixel 7 サイズの Chrome を使います。現行 E2E は商品閲覧/カート追加、320px の横はみ出し、言語 picker 表示のみです。注文保存、決済、サーバー token 取消、PostgreSQL 連携、実モデル障害は未実装かつ未テストです。

Vitest は package 近くの `src/__tests__` に置き、状態遷移、解析、検証、リクエスト境界を対象にします。API 追加では正・負の入力をテストし、動作中 Route Handler の状態、content type、言語、request ID を確認します。固定ボタンを持つ重要な画面では 320px、安全領域、ソフトキーボードも Playwright で検証します。

契約変更は `openapi/schema.yaml` → `pnpm api:generate` → 生成 diff の確認 → Zod、サーバー、カスタムクライアントの同期です。DB 変更は `packages/server/src/db/schema.ts` → `pnpm db:generate` → SQL のレビュー → 使い捨て PostgreSQL での migrate。最後に英中日の docs を同期し、build と必須チェックを実行します。[VS Code](/ja/editor)のタスクは同じ pnpm コマンドへの入口です。
