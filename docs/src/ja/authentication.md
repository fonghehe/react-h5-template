# 認証とセッションのライフサイクル

`/login` は React Hook Form と `loginSchema` で入力を確認し、同一 origin の `/api/auth/login` へ JSON を送ります。サーバーも再検証し `authenticateUser` を呼びます。デモモードは同梱アカウント、PostgreSQL モードは DB のユーザーと塩付き `scrypt` ハッシュを確認します。応答は公開ユーザー情報と署名付き bearer token です。token はユーザー ID と 7 日間の期限を含み、`AUTH_SECRET` で HMAC-SHA256 署名されます。

Zustand は token、表示用ユーザー、言語をブラウザーに保持します。`/api/user` は `Authorization: Bearer ...` を要求し、サーバーが署名・期限を検証して Repository から公開ユーザーを再取得します。ブラウザーに保存したユーザーオブジェクトだけで権限を判断しません。ただし現在の会員画面は保存済みオブジェクトを主に表示するので、その表示だけではサーバー token の有効性を証明しません。

`/api/auth/logout` は成功応答を返すだけで、サーバーでは token を取り消しません。会員画面は失敗時にもローカル token を消しますが、コピー済み token は期限まで利用可能です。これはデモのセッションであり、本番のログアウト保証ではありません。ログイン後のリダイレクトは単一 `/` で始まる内部パスだけを許し、`//` は拒否します。

本番では予測困難な `AUTH_SECRET` が必須です。開発時だけローカルの代替鍵があります。`DATABASE_URL` と秘密鍵を `NEXT_PUBLIC_*` に置かないでください。本番セッションには期限、更新/ローテーション、サーバー取消、デバイス管理、失効時の応答方針が必要です。HttpOnly Cookie を採用するなら `Secure`、`SameSite`、CSRF 防御も設計します。ログイン制限と監査も加え、現状 bearer header を前提とする OpenAPI・クライアント・テストを同時に更新してください。
