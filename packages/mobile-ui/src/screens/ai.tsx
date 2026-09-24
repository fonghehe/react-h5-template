'use client';

import { Bot, RotateCcw } from 'lucide-react';

import { ChatComposer } from '../components/chat-composer';
import { PageHeader } from '../components/page-header';
import { useAiChat } from '../hooks/use-ai-chat';
import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export default function AiPage() {
  const { toast } = useUi();
  const { locale, t } = useTranslation();
  const { messages, reset, send, stop, streaming } = useAiChat({
    locale,
    greeting: t('aiGreeting'),
    streamError: t('aiStreamError'),
    onError: (message) => toast(message, 'error'),
  });

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
          <button onClick={reset} aria-label={t('aiReset')}>
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
      <ChatComposer onSend={send} onStop={stop} streaming={streaming} />
    </main>
  );
}
