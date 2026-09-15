# React H5 Template

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

Next.js 16 と React 19 によるモバイル Web の monorepo です。独立して起動できる 3 つの UI アプリがあり、Ant Design Mobile、NutUI React、Arco Mobile はビジネス画面、API 契約、サーバー処理、PostgreSQL Repository を共有します。VitePress ドキュメントは英語が主で、中国語と日本語に対応するテーマがあります。

## 含まれる機能

- 3 つの独立した Next.js アプリ。商品、カート、ログイン、会員画面、モバイル Web API サンプル、AI デモの同じ操作経路を持ちます。
- 共通 `UiKit` 契約と 3 つのコンポーネントライブラリー用アダプター。共通画面は特定 UI ライブラリーに直接依存しません。
- 同一 origin の HTTP クライアント、Zod 入力検証、OpenAPI 契約、Orval の生成クライアント/MSW 補助ファイル、request ID を含む標準エラー。
- PostgreSQL 17 + Drizzle の商品/ユーザー Repository。`DATABASE_URL` がない場合は同梱デモデータを使います。
- 商品などのリモート状態は TanStack Query、ローカルカート・セッション・言語設定は Zustand、複雑なフォームは React Hook Form が担当します。

これは実行可能なテンプレートで、**本番ストアではありません**。チェックアウトはローカルの確認だけで注文を保存せず、課金もしません。AI はデモ回答をストリームで返し、実モデルを呼びません。ログアウトはブラウザー token を消しますが、サーバーでは取り消しません。実注文・決済・セッションを追加する前に[改善計画](./docs/src/ja/roadmap.md)を確認してください。

## ローカルで起動

Node.js 22.18+ と pnpm 11+ が必要です。リポジトリのルートで実行します。

```bash
pnpm install
pnpm dev
```

`pnpm dev` は 1 つの workspace を対話式で選びます。固定ポートの直接コマンドもあります。

| アプリ | コマンド | URL |
| --- | --- | --- |
| Ant Design Mobile | `pnpm dev:antd` | `http://127.0.0.1:6777/home` |
| NutUI React | `pnpm dev:nutui` | `http://127.0.0.1:6778/home` |
| Arco Mobile | `pnpm dev:arco` | `http://127.0.0.1:6779/home` |
| ドキュメント | `pnpm dev:docs` | `http://127.0.0.1:6780/react-h5-template/` |

`pnpm dev:all` は 4 つ全部を起動します。`compose.yaml` が起動するのは **PostgreSQL だけ**で、Next.js アプリと VitePress は上記コマンドによりホストで実行します。3 つのポートは異なるブラウザー origin なので、ローカルカートとセッションは自動同期しません。デモアカウントは `user / 123456` と `admin / 123456` です。

## PostgreSQL を使う

`.env.example` を `.env.local` にコピーし、`DATABASE_URL` の対象 DB を確認します。

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm db:setup
pnpm dev:antd
```

`pnpm db:setup` は `DATABASE_URL` が指定する DB を migrate して seed を書きます。URL 未設定なら商品/ユーザー Repository は同梱データを使います。URL が設定済みで DB が利用不能ならリクエストはエラーとなり、黙ってデモに戻りません。本番では長く予測困難な `AUTH_SECRET` が必須で、これと `DATABASE_URL` を `NEXT_PUBLIC_*` に置かないでください。

## ディレクトリーと詳しい資料

```text
apps/h5-*             3 つの Next.js アプリと薄い API 公開
packages/mobile-ui    共通ビジネス画面と Provider
packages/ui-*         Ant Design Mobile、NutUI、Arco アダプター
packages/api-client   同一 origin HTTP、SSE parser、生成クライアント
packages/contracts    domain 型と Zod リクエスト Schema
packages/server       認証、Handler、Repository、Drizzle Schema
packages/stores       ブラウザーセッション、言語設定、ローカルカート
packages/i18n         アプリの 5 言語メッセージ
openapi/              クライアント生成前に更新する HTTP 契約
drizzle/              版管理された PostgreSQL migration
docs/                 英中日の VitePress ガイド
```

[日本語ドキュメント](./docs/src/ja/index.md)から読み始められます。[English](./docs/src/index.md)と[中文](./docs/src/zh/index.md)の入口もあります。詳細は[フロントエンド状態](./docs/src/ja/frontend.md)、[コマース](./docs/src/ja/commerce.md)、[認証](./docs/src/ja/authentication.md)、[AI ストリーム](./docs/src/ja/ai.md)、[API/DB](./docs/src/ja/backend.md)、[テスト](./docs/src/ja/quality.md)、[VS Code のファイルネストとデバッグ](./docs/src/ja/editor.md)、[公開](./docs/src/ja/deployment.md)です。3 言語とも同じ 13 テーマのパスを持ちます。

## チェックとコード生成

```bash
pnpm lint          # Oxfmt、Oxlint、ESLint
pnpm typecheck     # Workspace 型検査
pnpm test          # Vitest 単体テスト
pnpm build         # 3 Next.js アプリと VitePress
pnpm test:e2e:antd # 1 つの UI の Playwright モバイル操作
pnpm api:generate  # OpenAPI -> packages/api-client 生成コード
pnpm db:generate   # Drizzle Schema -> SQL migration
pnpm check         # lint -> typecheck -> test -> build
```

契約変更では生成前に `openapi/schema.yaml` を編集します。Next.js build が `.next/types` を書き換えるため、`typecheck` と `build` は順番に実行してください。[.vscode 設定](./.vscode/settings.json)には同じ pnpm タスクとサーバー/ブラウザーの独立したデバッグ入口があります。
