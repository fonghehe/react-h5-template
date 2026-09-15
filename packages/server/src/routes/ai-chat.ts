import { chatRequestSchema, type Locale } from '@rh5/contracts';

import { fail, localeFrom, requestId, serverText } from '../http';

const encoder = new TextEncoder();
const event = (payload: object) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);

function answerFor(prompt: string, locale: Locale) {
  if (/react|next/i.test(prompt)) {
    if (locale === 'en-US') {
      return 'This monorepo uses the Next.js App Router for pages and Route Handlers. Shared business logic stays UI-independent, while Ant Design Mobile, NutUI React, and Arco Mobile provide a consistent experience through separate adapters.';
    }
    if (locale === 'ja-JP') {
      return 'この monorepo は Next.js App Router でページと Route Handler を統合しています。共通ビジネスロジックは UI に依存せず、Ant Design Mobile、NutUI React、Arco Mobile を個別のアダプターで統一しています。';
    }
    if (locale === 'zh-HK' || locale === 'zh-TW') {
      return '這個 monorepo 使用 Next.js App Router 整合頁面與 Route Handler；共用業務邏輯不依賴 UI，Ant Design Mobile、NutUI React 與 Arco Mobile 透過獨立適配層提供一致體驗。';
    }
    return '这套 monorepo 用 Next.js App Router 统一页面与 Route Handler；共享业务逻辑保持无 UI 依赖，Ant Design Mobile、NutUI React 与 Arco Mobile 通过独立适配层提供一致体验。';
  }
  if (locale === 'en-US') {
    return `I received: ${prompt}\n\nThis SSE stream comes from the shared Route Handler. Replace the server-side provider to connect a real model.`;
  }
  if (locale === 'ja-JP') {
    return `受け取りました：${prompt}\n\nこれは共通 Route Handler が返す SSE ストリームです。実際のモデルに接続するには、サーバー側の provider を置き換えてください。`;
  }
  if (locale === 'zh-HK' || locale === 'zh-TW') {
    return `已收到：${prompt}\n\n這是共用 Route Handler 輸出的 SSE 串流回應。接入真實模型時，只需替換伺服器端 provider。`;
  }
  return `我收到了：${prompt}\n\n这是共享 Route Handler 输出的 SSE 流式响应。接入真实模型时，只需要替换服务端 provider。`;
}

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(request, 400, serverText(request, 'invalidRequest'));
  const prompt = parsed.data.messages
    .findLast((message) => message.role === 'user')
    ?.content?.trim();
  const locale = localeFrom(request);
  if (!prompt) {
    return fail(request, 400, serverText(request, 'invalidRequest'));
  }

  const answer = answerFor(prompt, locale);
  const chunks = answer.match(/.{1,8}(?:\s|$)|.{1,8}/gu) ?? [answer];
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        event({ type: 'start', id: crypto.randomUUID(), requestId: requestId(request) }),
      );
      for (const delta of chunks) {
        if (request.signal.aborted) break;
        controller.enqueue(event({ type: 'delta', delta }));
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      if (!request.signal.aborted) {
        controller.enqueue(event({ type: 'finish' }));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  });
}
