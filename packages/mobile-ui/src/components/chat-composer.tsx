'use client';

import { Send, Square } from 'lucide-react';
import { useState } from 'react';

import { useTranslation } from '../hooks/use-translation';
import { useUi } from '../ui';

export function ChatComposer({
  onSend,
  onStop,
  streaming,
}: {
  onSend: (input: string) => Promise<void>;
  onStop: () => void;
  streaming: boolean;
}) {
  const { Button, TextArea } = useUi();
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const send = () => {
    const content = input.trim();
    if (!content || streaming) return;
    setInput('');
    void onSend(content);
  };

  return (
    <footer className="chat-composer">
      <TextArea
        value={input}
        onChange={setInput}
        placeholder={t('aiInput')}
        maxLength={1000}
        onEnter={(event) => {
          if (!event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
      />
      {streaming ? (
        <Button className="send-button stop" onClick={onStop} aria-label={t('aiStop')}>
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
  );
}
