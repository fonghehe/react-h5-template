# はじめに

## 要件と動作モード

Node.js 22.18 以上、pnpm 11 以上を使い、リポジトリのルートからインストールします。3 つの Next.js アプリは独立したサーバー、4 つ目は VitePress ドキュメントです。UI を試すだけなら PostgreSQL は任意で、商品・ユーザー Repository は同梱デモデータ、カート・セッションはそのブラウザー origin の保存を使います。

| モード | ホスト/コンテナーのプロセス | データ |
| --- | --- | --- |
| デモ | ホスト上の選んだ Next.js アプリ、任意で docs | 同梱商品・ユーザー、ローカルカート |
| DB 開発 | ホスト上の Next.js、Docker 上の PostgreSQL 17 | マイグレーションと seed 後の DB |
| 全アプリ比較 | ホスト上の 3 Next.js と VitePress | アプリ別の同一 origin API とブラウザー保存 |

`compose.yaml` は **PostgreSQL のみ**で、アプリや docs はコンテナー化しません。最初は次の通りです。

```bash
pnpm install
pnpm dev
```

`pnpm dev` は `turbo-run` の対話式メニューから 1 つを選びます。直接起動する場合:

| アプリ | コマンド | URL |
| --- | --- | --- |
| Ant Design Mobile | `pnpm dev:antd` | `http://127.0.0.1:6777/home` |
| NutUI React | `pnpm dev:nutui` | `http://127.0.0.1:6778/home` |
| Arco Mobile | `pnpm dev:arco` | `http://127.0.0.1:6779/home` |
| ドキュメント | `pnpm dev:docs` | `http://127.0.0.1:6780/react-h5-template/` |

全部を比較するときは `pnpm dev:all`。ポートは固定なので占有時はエラーになります。Next.js の開発・ビルドは、以前確認された複数インスタンスの Turbopack panic を避けるため webpack を使います。同じポートで再起動する前に既存プロセスを止めます。

## PostgreSQL を接続する

`.env.example` を `.env.local` にコピーし、`DATABASE_URL` が Compose の公開ポートを指すことを確認します。

```bash
cp .env.example .env.local
docker compose up -d postgres
pnpm db:setup
pnpm dev:antd
```

`db:setup` はマイグレーション後に seed を行い、**指定 URL の DB を変更します**。seed は upsert なので再実行するとデモ商品・ユーザーを更新します。ホストの 5432 が使用中なら Compose のホストポートと URL の両方を変更します。`DATABASE_URL` が未設定のときだけデモ Repository を使用し、設定した DB が到達不能ならエラーを出します。

デモ資格情報は `user / 123456` と `admin / 123456`。本番では推測困難な `AUTH_SECRET` が必須です。`PGSSL=require` は TLS 必須の DB 向けですが、現在の pool は証明書検証を無効にします。本番では事業者に合う TLS 方針を再確認してください。

## 最初の確認と障害時

商品をカートへ入れ、会員画面で言語を切り替えます。HTTP 応答は次で確認できます。

```bash
curl -H 'Accept-Language: en-US' 'http://127.0.0.1:6777/api/products?page=1&pageSize=2'
```

正常時は `code: 0`、商品ページ、`requestId`。不正なページ値は 400 JSON、AI は有効なメッセージでのみ SSE を開始します。ポート占有なら既存サーバーを停止し、DB 障害なら Compose health check、URL と公開ポート、migration/seed の対象を確認します。エディターの型診断が CLI と異なるときは [VS Code](/ja/editor)のローカル TypeScript 設定を使います。チェックアウトはローカルの模擬です。境界は [コマース](/ja/commerce)を参照してください。
