import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

import { ChatComposer } from '../components/chat-composer';
import type { UiButtonProps, UiTextAreaProps } from '../ui';

vi.mock('../ui', () => ({
  useUi: () => ({
    Button: ({ children, ...props }: UiButtonProps) => <button {...props}>{children}</button>,
    TextArea: ({ onChange, onEnter, value }: UiTextAreaProps) => (
      <>
        <button onClick={() => onChange?.('draft')}>Draft</button>
        <textarea readOnly value={value} onKeyDown={(event) => onEnter?.(event)} />
      </>
    ),
  }),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe('chat composer keyboard boundary', () => {
  it.each([
    [{ isComposing: true }, false],
    [{ keyCode: 229 }, false],
    [{ shiftKey: true }, false],
    [{}, true],
  ] as const)(
    'handles Enter with %j without sending composition text',
    async (properties, shouldSend) => {
      const container = document.createElement('div');
      document.body.append(container);
      const root = createRoot(container);
      const send = vi.fn<() => Promise<void>>().mockResolvedValue();
      try {
        await act(async () =>
          root.render(<ChatComposer onSend={send} onStop={() => undefined} streaming={false} />),
        );
        await act(async () => container.querySelector<HTMLButtonElement>('button')?.click());
        await act(async () =>
          container
            .querySelector('textarea')
            ?.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, ...properties }),
            ),
        );
        expect(send).toHaveBeenCalledTimes(shouldSend ? 1 : 0);
        expect(container.querySelector('textarea')?.value).toBe(shouldSend ? '' : 'draft');
      } finally {
        await act(async () => root.unmount());
        container.remove();
      }
    },
  );
});
