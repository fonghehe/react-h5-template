# ビルド、デプロイ構成、docs 公開

`pnpm build` は **別々の** 3 Next.js アプリと VitePress を作ります。本番ではどのアプリを公開するか選びます。各アプリは自身の Next.js サーバーと同一 origin の `/api` Route Handler を持ち、独立した共通 API サーバーはありません。静的ページだけを配置しても認証、商品、SSE は動きません。3 アプリ全てを公開するなら hostname/path のルーティングとサーバー環境がそれぞれ必要で、`DATABASE_URL` を設定すると pool も個別にできます。

個別ビルドは `pnpm build:antd`、`pnpm build:nutui`、`pnpm build:arco`、起動は対応 package の `start`。現在は `127.0.0.1` の固定ポートに bind するのでコンテナーや遠隔 host ではネットワーク/逆プロキシ設計を別途行います。`compose.yaml` はローカル PostgreSQL 17 だけで、アプリ Dockerfile、Kubernetes、readiness endpoint、本番 process supervisor はありません。

本番 `AUTH_SECRET` は必須。DB-backed の商品/ユーザーには `DATABASE_URL` と事前 migration が必要です。URL がなければ公知のパスワードを持つデモユーザーを使います。現状 `PGSSL=require` は証明書検証を無効化するため、接続先 identity の検証を保証しません。秘密鍵の更新、バックアップ、pool 容量、ログも運用設計が必要です。チェックアウトと AI はデモ、bearer token はログアウトで取り消せないので、実注文や課金を受け付けないでください。

`pnpm build:docs` は英中日 3 系統の VitePress ページを作ります。base path は `/react-h5-template/` です。初回公開前に [Settings → Pages](https://github.com/fonghehe/react-h5-template/settings/pages) を開き、Source を **GitHub Actions** にして Pages を有効にします。artifact のアップロードだけでは有効化されず、Pages が無効だと `actions/deploy-pages` はデプロイ作成時に HTTP 404 を返します。`actions/configure-pages` は有効なサイトを設定しますが、標準の `GITHUB_TOKEN` だけでは初回の有効化はできません。この workflow が公開するのは **ドキュメントのみ**で、Next.js アプリサーバーではありません。

Source を変更した後、docs/設定変更を `main` に push するか、**Deploy Docs to GitHub Pages → Run workflow** を実行します。`deploy` job の成功を確認し、`https://fonghehe.github.io/react-h5-template/` を開いてください。ローカル build や artifact upload の成功だけでは公開サイトの稼働を証明できません。

```bash
pnpm build:docs
pnpm --filter @rh5/docs preview
```

ローカル preview は 6780。リポジトリ名や公開 path が変われば VitePress base とリンクを更新します。本番コマースに必要な追加は[改善計画](/ja/roadmap)を参照してください。
