# フロントエンド構成と状態の責務

## 3 つのアプリと共通画面

`apps/h5-antd-mobile`、`apps/h5-nutui`、`apps/h5-arco-mobile` は独立した Next.js アプリです。それぞれの `src/app` はルート、レイアウト、メタデータ、薄い API Route Handler の公開を担当します。ビジネス画面は通常 `packages/mobile-ui` にあり、アプリの `AppProviders` が個別の `packages/ui-*` アダプターを注入します。共通画面は `useUi()` でボタン、入力、タブ、ダイアログ、トーストを取得し、特定ライブラリーを直接 import しません。共通画面の変更は 3 アプリに反映され、ライブラリー固有の修正はそのアダプターだけに置きます。

| ルート | 役割 | 状態の所有者 |
| --- | --- | --- |
| `/products`、`/products/[id]` | 一覧、詳細、更新、ページング | TanStack Query |
| `/cart`、`/checkout` | 選択、数量、デモフォーム | Zustand カートと React Hook Form |
| `/login`、`/member` | ログイン、プロフィール、言語 | Zustand セッション。`/api/user` は別のサーバー検証用 |
| `/ai` | デモのストリーム会話 | 画面内のメッセージと SSE reader |
| `/examples/*` | Query、HTTP、モバイル Web API | サンプルごとに異なる |

アプリのポートは異なるブラウザー origin です。したがってカートとセッションは自動的に共有されません。[はじめに](/ja/getting-started)に固定ポートを記載しています。

## Query、Zustand、フォーム

`AppProviders` はアプリごとに `QueryClient` を作成し、30 秒の stale time、1 回の再試行、フォーカス時再取得なしを設定します。一覧のキーは `['products', locale]`、詳細は `['product', id, locale]`。言語をキーに入れるため、英語の商品結果を日本語として再利用しません。リモート結果を Zustand にコピーしない方針です。

商品一覧、詳細、ページングのサンプルは Query の `signal` を API クライアント経由で `fetch` に渡します。購読がなくなったクエリーやキャンセルされたクエリーでは、処理中のリクエストを中止できます。キャンセルをネットワーク障害に変換しません。一覧のカート件数は独立した `CartLink` が購読するため、数量の変更で商品カード全体を再描画せずにバッジを更新します。

`packages/stores/src/session.ts` は言語、bearer token、表示用ユーザーを保持します。`cart.ts` は商品スナップショット、1～99 の数量、選択状態を保持します。両方ともクライアントの mount 後にブラウザー保存を復元し、サーバー描画中に storage を読みません。スナップショットから算出した合計は注文の権威ある価格ではありません。詳細画面のハートは画面内状態であり、保存済みお気に入り API はありません。

`MobileShell` は主要画面に下部タブを表示し、ログイン、カート、チェックアウト、AI、詳細では隠します。共通 CSS は safe area、動的 viewport、タッチ操作、固定ドックを扱います。新しい固定操作は 320px とソフトキーボード表示時に検証してください。新画面のリモートデータは Query、好みとカートは Zustand、編集途中のフォームは React Hook Form に置きます。

NutUI の Toast と確認ダイアログは、`ConfigProvider` 内の `NutuiFeedback` で描画します。インストール済みバージョンの静的メソッドが使う旧 ReactDOM API を避け、React 19 に対応します。Toast を置き換えると表示時間を計り直し、アンマウント時にはタイマーと未完了の確認を解除します。

Arco の静的 Toast と確認ダイアログには、呼び出し時にも `createRoot` を渡します。`ContextProvider` の設定だけでは初期化されません。NutUI の確認画面はネイティブのモーダル `dialog` と NutUI のボタンを使い、キーボードによるキャンセル、フォーカス管理、選択中の言語に対応します。
