'use client';

import { useEffect, useRef, useState } from 'react';

import { consumeSseChunk } from '@rh5/api-client';
import type { Locale } from '@rh5/contracts';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const initialMessages: Message[] = [{ id: 'welcome', role: 'assistant', content: '' }];

export function useAiChat({
  locale,
  greeting,
  streamError,
  onError,
}: {
  locale: Locale;
  greeting: string;
  streamError: string;
  onError: (message: string) => void;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      const active = controller.current;
      controller.current = null;
      active?.abort();
    },
    [],
  );

  const stop = () => {
    const active = controller.current;
    controller.current = null;
    active?.abort();
    setStreaming(false);
  };

  const reset = () => {
    stop();
    setMessages(initialMessages);
  };

  const send = async (input: string) => {
    const content = input.trim();
    // The ref also guards multiple submissions before React commits pending state.
    if (!content || controller.current) return;
    const active = new AbortController();
    controller.current = active;
    const assistantId = crypto.randomUUID();
    const outgoing: Message[] = [
      ...messages.map((message) =>
        message.id === 'welcome' ? { ...message, content: greeting } : message,
      ),
      { id: crypto.randomUUID(), role: 'user', content },
    ];
    setMessages([...outgoing, { id: assistantId, role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          'Accept-Language': locale,
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        },
        body: JSON.stringify({ messages: outgoing }),
        signal: active.signal,
      });
      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(error?.message || streamError);
      }
      if (!response.body) throw new Error(streamError);
      const reader = response.body.getReader();
      try {
        const decoder = new TextDecoder();
        let buffer = '';
        while (controller.current === active) {
          const { done, value } = await reader.read();
          if (controller.current !== active) break;
          buffer += decoder.decode(value, { stream: !done });
          const parsed = consumeSseChunk(buffer);
          buffer = parsed.rest;
          const delta = parsed.events
            .filter((event) => event.type === 'delta')
            .map((event) => event.delta ?? '')
            .join('');
          if (delta) {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + delta }
                  : message,
              ),
            );
          }
          if (done) break;
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (controller.current === active && !active.signal.aborted) {
        onError(error instanceof Error ? error.message : streamError);
      }
    } finally {
      // An older request must not clear a newer request after stop/reset.
      if (controller.current === active) {
        controller.current = null;
        setStreaming(false);
      }
    }
  };

  return { messages, reset, send, stop, streaming };
}
