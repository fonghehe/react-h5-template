# アーキテクチャと改善計画

`apps/h5-*` は独立した Next.js アプリです。共通画面は `packages/mobile-ui`、UI の差分は `packages/ui-*`、API クライアントは `packages/api-client`、Zod 契約は `packages/contracts`、Route Handler の処理と Repository は `packages/server` にあります。ページに SQL を置かず、API の実装を 3 つのアプリで共有します。

商品画面から同一オリジンの API クライアントを呼び、言語とリクエスト ID を送ります。サーバーは入力を検証し、デモデータまたは PostgreSQL の Repository を使い、`{ code, data, message, requestId }` を返します。無効なページ番号・商品 ID は `400` を返します。AI の入力エラーは SSE 開始前に JSON で返します。

| 領域 | 現在の実装 | 本番運用に必要な境界 |
| --- | --- | --- |
| 商品 | デモまたは PostgreSQL の読み取り | 在庫、価格改定、管理機能 |
| カート | ブラウザーごとの商品スナップショット | サーバーで最新価格を取得 |
| チェックアウト | フォーム確認後にローカルカートを削除 | 認証済み注文 API、冪等キー、トランザクション、在庫引当、決済 Webhook |
| 認証 | ブラウザー保存の署名付き bearer token | 取り消し可能なセッション、Cookie/CSRF 方針、レート制限 |
| AI | デモの SSE 応答 | Provider、利用制限、配信中エラーの SSE イベント |

最初に実装すべき商取引の境界は注文作成サービスです。商品 ID と数量からサーバーが価格を取得し、1 つのトランザクションで在庫と注文を確定します。決済事業者の検証済み Webhook を受けるまでは支払い済みにしません。クライアントの価格を信用しない設計にします。

## モジュール境界の具体例

ページディレクトリーはルートとメタデータ、`packages/mobile-ui` は共通画面の動作を担当します。`UiKit` は小さな共通契約です。特定 UI ライブラリーの API を共通画面へ直接持ち込まず、全アダプターが提供可能な能力にするか、そのアプリだけに置きます。クライアントとサーバーの双方で使う `packages/contracts` に DB や秘密鍵を import しません。`packages/server` は server-only で、Repository が DB 行を公開 domain object に変換してから返します。

Orval の生成クライアントとカスタム `api` wrapper は現状共存しています。生成物は OpenAPI から React Query/MSW を作れることを検証し、共通画面は同一 origin、言語、request ID、envelope エラーを統一する wrapper を主に使います。AI は SSE のイベント列なので別の fetch/reader を使い、単一 JSON として扱いません。

例として `/products?page=1junk` は薄い Route Handler から共通サーバー処理へ渡され、`productPageSchema` が Repository へのアクセス前に拒否します。HTTP 400 と UUID request ID を持つ翻訳済み envelope を返し、クライアントは `ApiError` として画面のエラー状態へ渡します。逆プロキシが HTML を返す場合も wrapper は不正 API 応答としてローカル request ID を保持します。有効な ID のみ Repository を呼びます。`DATABASE_URL` を設定した DB が到達不能な場合はデモへ黙って fallback せずエラーです。3 アプリを同時稼働すると Node process、DB pool、ブラウザーカートもそれぞれ 3 つになります。

詳細は [フロントエンド](/ja/frontend)、[コマース](/ja/commerce)、[認証](/ja/authentication)、[AI](/ja/ai)、[バックエンド](/ja/backend)、[改善計画](/ja/roadmap)を参照してください。
