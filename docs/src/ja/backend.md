# API 境界と PostgreSQL バックエンド

各アプリの `src/app/api` は `packages/server/src/routes` の薄い公開ファイルで、SQL を埋め込みません。商品リクエストは共通画面 → `packages/api-client` → そのアプリの同一 origin `/api/products` → Route Handler → Zod 検証 → Repository → 同梱データまたは PostgreSQL → `{ code, data, message, requestId }` と進みます。

| メソッド/パス | 現在の機能 | 認証 |
| --- | --- | --- |
| `GET /api/products` | 言語別の商品ページ | なし |
| `GET /api/products/{id}` | 1 商品、なければ 404 | なし |
| `POST /api/auth/login` | デモ/DB の資格情報と token | なし |
| `POST /api/auth/logout` | 成功応答、ブラウザーで消去 | サーバー取消なし |
| `GET /api/user` | bearer 署名・期限を検証しユーザー取得 | Bearer |
| `POST /api/ai/chat` | デモ SSE、不正入力は開始前 JSON 400 | なし |

`packages/contracts` の Zod はページ番号 1～10000、件数 1～20、商品 ID、ログイン、AI メッセージを確認します。不正 ID は 400、正しい ID で商品がない場合は 404。誤ったログインは 403、`/api/user` の token 欠落/無効は 401。カスタム API クライアントは `/api/` 相対パスだけを許し、`Accept-Language` と UUID request ID を送ります。HTTP/業務、ネットワーク、壊れた envelope は `ApiError` になります。サーバーは重み付き言語ヘッダーを解釈し、未対応なら簡体字中国語に戻します。翻訳された `message` は表示用で、状態と `code` は機械向けです。まだ request ID を統一サーバーログへ接続していません。

契約は `openapi/schema.yaml`。**契約を先に変更して** `pnpm api:generate` を実行すると、Orval が `packages/api-client/src/generated/generated` に React Query と MSW の生成物を書きます。共通画面は現状カスタム `api` wrapper が中心です。AI はイベント列なので単一 JSON とせず、別の SSE Reader を使います。Route Handler、Zod、クライアントを契約に合わせ、生成ファイルは手編集しません。Repository は DB 行を公開 `Product`/`User` へ変換します。

`getDatabase()` は `DATABASE_URL` がなければ null を返し、Repository は同梱データを使います。URL があれば `pg.Pool` と Drizzle を作り、接続エラーはデモへ黙って切り替えません。開発時は各プロセス最大 5 接続、本番は 10。3 アプリを同時に動かすと pool も 3 個です。`products` は中英日の商品名、デモ価格、会員価格、画像、店舗/配送/説明、順序と時刻。`users` はユーザー名、塩付きハッシュ、公開プロフィール、役割と時刻。SQL migration は `drizzle/`、seed は upsert です。商品説明等は DB で完全翻訳されておらず、注文、在庫、セッション、会話テーブルはありません。
