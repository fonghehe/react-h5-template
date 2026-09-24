import { act, createElement, StrictMode, useLayoutEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAiChat } from '../use-ai-chat';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

type ReadChunk = () => Promise<{ done: boolean; value?: Uint8Array }>;

function streamResponse(read = vi.fn<ReadChunk>().mockResolvedValue({ done: true })) {
  const releaseLock = vi.fn<() => void>();
  const response = {
    ok: true,
    body: { getReader: () => ({ read, releaseLock }) },
  } as unknown as Response;
  return { response, releaseLock };
}

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe('AI chat lifecycle', () => {
  let root: Root;
  let container: HTMLDivElement;
  let chat: ReturnType<typeof useAiChat>;
  const onError = vi.fn<(message: string) => void>();

  function Harness() {
    const value = useAiChat({
      locale: 'en-US',
      greeting: 'Hello',
      streamError: 'Stream failed',
      onError,
    });
    useLayoutEffect(() => {
      chat = value;
    });
    return null;
  }

  beforeEach(async () => {
    onError.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(createElement(StrictMode, null, createElement(Harness))));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('combines deltas from one read and releases the reader', async () => {
    const read = vi
      .fn<ReadChunk>()
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode(
          'data: {"type":"delta","delta":"<b>"}\n\ndata: {"type":"delta","delta":"hello"}\n\n',
        ),
      })
      .mockResolvedValue({ done: true });
    const { response, releaseLock } = streamResponse(read);
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);

    await act(async () => chat.send('  question  '));

    expect(chat.messages.map((message) => message.content)).toEqual([
      'Hello',
      'question',
      '<b>hello',
    ]);
    expect(chat.streaming).toBe(false);
    expect(releaseLock).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      '/api/ai/chat',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept-Language': 'en-US',
          'X-Request-ID': expect.any(String),
        }),
      }),
    );
  });

  it('rejects duplicate submissions before the pending render commits', async () => {
    const pending = deferred<Response>();
    const fetch = vi.fn<typeof globalThis.fetch>().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetch);
    let request!: Promise<void>;

    await act(async () => {
      request = chat.send('first');
      await chat.send('duplicate');
    });
    expect(fetch).toHaveBeenCalledOnce();

    await act(async () => {
      pending.resolve(streamResponse().response);
      await request;
    });
  });

  it('keeps a newer stream active when a stopped request rejects late', async () => {
    const old = deferred<Response>();
    const next = deferred<Response>();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(next.promise);
    vi.stubGlobal('fetch', fetch);
    let oldRequest!: Promise<void>;
    let nextRequest!: Promise<void>;

    await act(async () => {
      oldRequest = chat.send('first');
    });
    const signal = fetch.mock.calls[0][1]?.signal as AbortSignal;
    await act(async () => chat.stop());
    expect(signal.aborted).toBe(true);
    await act(async () => {
      nextRequest = chat.send('second');
    });
    await act(async () => {
      old.reject(new Error('Late failure'));
      await oldRequest;
    });

    expect(chat.streaming).toBe(true);
    expect(onError).not.toHaveBeenCalled();
    await act(async () => {
      next.resolve(streamResponse().response);
      await nextRequest;
    });
    expect(chat.streaming).toBe(false);
  });

  it('resets an active stream and discards a late chunk', async () => {
    const pending = deferred<{ done: boolean; value: Uint8Array }>();
    const { response, releaseLock } = streamResponse(
      vi.fn<ReadChunk>().mockReturnValue(pending.promise),
    );
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);
    let request!: Promise<void>;

    await act(async () => {
      request = chat.send('first');
    });
    await act(async () => chat.reset());
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    await act(async () => {
      pending.resolve({
        done: false,
        value: new TextEncoder().encode('data: {"type":"delta","delta":"late"}\n\n'),
      });
      await request;
    });

    expect(chat.messages).toEqual([{ id: 'welcome', role: 'assistant', content: '' }]);
    expect(chat.streaming).toBe(false);
    expect(releaseLock).toHaveBeenCalledOnce();
  });

  it('aborts on unmount and suppresses errors from the abandoned request', async () => {
    const pending = deferred<Response>();
    const fetch = vi.fn<typeof globalThis.fetch>().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetch);
    let request!: Promise<void>;

    await act(async () => {
      request = chat.send('first');
    });
    await act(async () => root.render(null));
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    pending.reject(new TypeError('Fetch cancelled'));
    await request;
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports API errors before trying to read an SSE stream', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ message: 'Invalid history' }, { status: 400 })),
    );

    await act(async () => chat.send('question'));

    expect(onError).toHaveBeenCalledWith('Invalid history');
    expect(chat.streaming).toBe(false);
  });
});
