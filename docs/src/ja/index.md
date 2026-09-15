---
layout: home
hero:
  name: React H5 Template
  text: モバイル Web のフルスタック基盤
  tagline: 3 種類の UI アプリでビジネス層、API 契約、Next.js バックエンドを共有します。
  actions:
    - theme: brand
      text: はじめる
      link: /ja/getting-started
    - theme: alt
      text: アーキテクチャ
      link: /ja/architecture
features:
  - title: 独立した 3 つのアプリ
    details: Ant Design Mobile、NutUI React、Arco Mobile が同じ画面契約を利用します。
  - title: 明確なデータ境界
    details: TanStack Query はリモートデータ、Zustand はセッションとカート、Repository は PostgreSQL を担当します。
  - title: 検証可能な API
    details: Zod と OpenAPI による契約、リクエスト ID 付きの標準レスポンスを備えます。
---

商品閲覧、カート、ログイン、ローカルのチェックアウト模擬、モバイル Web API、国際化、SSE チャットのデモを含みます。チェックアウトは注文を保存せず、決済も実行しません。AI は本番モデルに接続していません。

## 操作の流れから読む

[はじめに](/ja/getting-started)で同梱データまたは PostgreSQL の起動を確認し、[フロントエンド](/ja/frontend)で Query、Zustand、フォームと UI アダプターの責務を把握します。[コマース](/ja/commerce)は商品、詳細、カート、ローカルチェックアウトを追い、最初に必要なサーバー注文境界を説明します。[認証](/ja/authentication)はログイン署名、`/api/user` 検証とログアウトの限界を示し、[AI](/ja/ai)は SSE イベントと開始前/開始後エラーを扱います。

[バックエンド](/ja/backend)は endpoint、状態、Repository、DB をつなぎます。[国際化](/ja/internationalization)は 5 言語 UI と 3 言語 docs、未翻訳 DB フィールドを区別します。[品質](/ja/quality)には実際のチェックと既存テスト範囲、[VS Code](/ja/editor)には pnpm と一致する編集/デバッグ入口があります。[公開](/ja/deployment)は独立した 3 サーバーと docs の hosting、[改善計画](/ja/roadmap)は本番向けの提案順序を記載します。
