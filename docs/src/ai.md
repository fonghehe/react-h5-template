# AI streaming contract

The `/ai` page is a working SSE client for a demonstration Route Handler at `POST /api/ai/chat`. It is not connected to an external model and has no stored conversation history.

## Request and event flow

The screen keeps messages in React state and sends its current array with `Accept-Language` plus `X-Request-ID`. `chatRequestSchema` accepts at most 30 messages and enforces a 1,000-character limit for each before any SSE bytes are written. The screen does not currently trim long histories, so a conversation exceeding the request limit returns an error. An invalid request returns the ordinary JSON `{ code, data: null, message, requestId }` envelope with HTTP 400. The page reads that error message before trying to parse a stream.

A valid request receives `Content-Type: text/event-stream`. The server emits a `start` event with an assistant ID and request ID, multiple `delta` events with text fragments, a `finish` event, and `data: [DONE]`. `consumeSseChunk` holds incomplete UTF-8/line boundaries for the next read and ignores malformed provider events. The page appends deltas as **text** in React; it does not enable raw HTML. The stop control aborts the request and the server checks `request.signal.aborted` between chunks.

```text
data: {"type":"start","id":"...","requestId":"..."}

data: {"type":"delta","delta":"Hello"}

data: {"type":"finish"}

data: [DONE]
```

## Replacing the demo answer

Keep the model key and provider URL in server-only configuration. Add a provider adapter behind `packages/server/src/routes/ai-chat.ts`, validate model input, bound context and output size, and map provider chunks to the existing SSE event contract. Record request IDs and provider usage on the server, apply abuse and cost limits, and sanitize any future Markdown renderer. AI output is untrusted. The current text rendering is safe because React escapes it.

Before streaming starts, errors can be HTTP status plus JSON. After the first SSE byte, the HTTP status is already committed: provider failures must be represented as an SSE error event, followed by a terminal event, and the client must display that state. The current parser and page only handle `start`, `delta`, and `finish`, so post-stream error support is still future work. Persistence would require a conversation/message repository and a clear retention policy; it is not implied by the in-memory page state.
