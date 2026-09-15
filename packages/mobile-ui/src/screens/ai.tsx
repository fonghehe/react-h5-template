'use client';

import { Bot, RotateCcw, Send, Square } from 'lucide-react';
import { useRef, useState } from 'react';

import { consumeSseChunk } from '@rh5/api-client';

import { PageHeader } from '../components/page-header';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const initialMessages: Message[] = [{ id: 'welcome', role: 'assistant', content: '' }];

export default function AiPage() {
  const { Button, TextArea, toast } = useUi();
  const { locale, t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const send = async () => {
    const content = input.trim();
    if (!content || streaming) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    const outgoing = [
      ...messages.map((message) =>
        message.id === 'welcome' ? { ...message, content: t('aiGreeting') } : message,
      ),
      userMessage,
    ];
    setMessages([...outgoing, { id: assistantId, role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);
    controller.current = new AbortController();

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
        signal: controller.current.signal,
      });
      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(error?.message || t('aiStreamError'));
      }
      if (!response.body) throw new Error(t('aiStreamError'));
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const parsed = consumeSseChunk(buffer);
        buffer = parsed.rest;
        for (const event of parsed.events) {
          if (event.type === 'delta' && event.delta) {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + event.delta }
                  : message,
              ),
            );
          }
        }
        if (done) break;
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        toast(error instanceof Error ? error.message : t('sendFailed'), 'error');
      }
    } finally {
      setStreaming(false);
      controller.current = null;
    }
  };

  return (
    <main className="app-frame ai-route">
      <PageHeader title={t('ai')} />
      <section className="chat-page">
        <header className="chat-intro">
          <div>
            <Bot size={21} />
          </div>
          <span>
            <strong>{t('aiStreamTitle')}</strong>
            <small>{t('aiStreamCaption')}</small>
          </span>
          <button onClick={() => setMessages(initialMessages)} aria-label={t('aiReset')}>
            <RotateCcw size={18} />
          </button>
        </header>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`chat-message ${message.role}`} key={message.id}>
              {message.role === 'assistant' && (
                <div className="chat-avatar">
                  <Bot size={17} />
                </div>
              )}
              <p>
                {(message.id === 'welcome' ? t('aiGreeting') : message.content) || (
                  <span className="typing">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </p>
            </article>
          ))}
        </div>
      </section>
      <footer className="chat-composer">
        <TextArea
          value={input}
          onChange={setInput}
          placeholder={t('aiInput')}
          maxLength={1000}
          onEnter={(event) => {
            if (!event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
        />
        {streaming ? (
          <Button
            className="send-button stop"
            onClick={() => controller.current?.abort()}
            aria-label={t('aiStop')}
          >
            <Square size={17} fill="currentColor" />
          </Button>
        ) : (
          <Button
            className="send-button"
            tone="primary"
            onClick={send}
            disabled={!input.trim()}
            aria-label={t('aiSend')}
          >
            <Send size={18} />
          </Button>
        )}
      </footer>
    </main>
  );
}
