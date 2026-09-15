# AI 流式协议

`/ai` 页面是真实可运行的 SSE 客户端，但服务端 `/api/ai/chat` 只生成固定演示回答，没有模型调用，也没有持久化历史会话。

页面把消息保存在 React 状态，并发送当前全部消息，附带语言头和 `X-Request-ID`。`chatRequestSchema` 在流开始前限制最多 30 条消息及单条 1000 字符。页面现在不会自动截断长历史，超过上限时返回错误。输入不合法时，服务器返回 HTTP 400 的普通 JSON `{ code, data: null, message, requestId }`；页面先读 JSON 错误，不会把它当 SSE 解析。

成功响应是 `text/event-stream`：`start` 给助手消息 ID 与请求 ID，随后多次 `delta` 给文本片段，`finish` 结束，再发 `data: [DONE]`。`consumeSseChunk` 保留不完整的分块边界，下一次读取再接上；损坏事件会跳过。页面将 delta 当 React 文本渲染，不开启原始 HTML。点击停止会 Abort 请求，服务端在每个片段间检查 `request.signal.aborted`。

```text
data: {"type":"start","id":"...","requestId":"..."}

data: {"type":"delta","delta":"你好"}

data: {"type":"finish"}

data: [DONE]
```

接入真实模型时，密钥和地址必须放服务端；通过 `packages/server` 后面的 Provider 接口把模型片段映射到现有事件，限制上下文、输出和成本，记录请求 ID，支持中止并防滥用。AI 输出是不可信内容；当前纯文本渲染由 React 转义。若未来支持 Markdown，先做安全净化。

首字节前的错误可以改变 HTTP 状态并返回 JSON；首字节之后状态已经确定，Provider 失败必须发送 SSE 错误事件和终止事件。现有客户端只处理 `start/delta/finish`，流中错误仍待实现。持久化要新增 conversation/message 仓储与保留策略，当前页面消息状态并不等于服务端保存了对话。
