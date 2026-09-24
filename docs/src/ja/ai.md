# AI の SSE ストリーム契約

`/ai` は動作する SSE クライアントですが、`POST /api/ai/chat` は固定のデモ回答を作るだけです。外部モデル呼び出しもサーバー側会話保存もありません。

画面は React state の現在のメッセージを全て送り、`Accept-Language` と `X-Request-ID` を付けます。`chatRequestSchema` はストリーム開始前に最大 30 件、各 1,000 文字と形を検証します。画面は長い履歴をまだ切り詰めないため、上限を超えるとエラーになります。不正な入力は HTTP 400 の通常 JSON `{ code, data: null, message, requestId }` です。画面はこの JSON エラーを読んでから SSE の解析を開始するか判断します。

共通の `useAiChat` Hook がメッセージとリクエストのライフサイクルを管理します。停止、リセット、アンマウント時にリクエストを中止し、古いリクエストの遅延応答やエラーが新しい会話の状態を書き換えないようにします。読み取り後は Reader のロックを解放します。1 回の読み取りに含まれる複数の delta はまとめて反映します。入力中の下書きは `ChatComposer` 内に置くため、文字を入力するたびに会話全体を再描画しません。

成功応答は `text/event-stream`。`start` にアシスタント ID と request ID、複数の `delta` にテキスト片、`finish` に終了、最後に `data: [DONE]` が入ります。`consumeSseChunk` は分割された境界を次回の読み取りまで保持し、壊れたイベントを無視します。画面は delta を React のテキストとして描画し、生 HTML を有効にしません。停止ボタンで Abort するとサーバーも片ごとに `request.signal.aborted` を確認します。

```text
data: {"type":"start","id":"...","requestId":"..."}

data: {"type":"delta","delta":"こんにちは"}

data: {"type":"finish"}

data: [DONE]
```

実際のモデルはサーバー側 Provider インターフェースの背後に置き、鍵、文脈長、出力、コスト、乱用対策を管理します。AI 出力は信用しないでください。現在は React のテキストエスケープで安全に表示しますが、Markdown を導入するときはサニタイズが必要です。

最初の SSE byte 前なら HTTP 状態と JSON エラーを返せます。送信開始後は状態変更できないため、Provider 障害は SSE エラーイベントと終端イベントにします。現状の画面と parser は `start/delta/finish` だけを扱い、途中エラーは今後の仕事です。会話永続化が必要なら Repository と保持方針を追加します。現在の画面 state は永続保存ではありません。
