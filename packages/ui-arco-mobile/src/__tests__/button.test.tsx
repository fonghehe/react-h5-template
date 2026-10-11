import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';

import { arcoMobileKit } from '../index';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

it('preserves native submit, disabled and accessible button semantics', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const submit = vi.fn<() => void>();
  const Button = arcoMobileKit.Button;
  try {
    await act(async () =>
      root.render(
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Button type="submit" aria-label="Submit">
            Save
          </Button>
        </form>,
      ),
    );
    const button = container.querySelector('button')!;
    expect(button.type).toBe('submit');
    expect(button.getAttribute('aria-label')).toBe('Submit');
    await act(async () => button.click());
    expect(submit).toHaveBeenCalledOnce();
    await act(async () =>
      root.render(
        <Button disabled aria-label="Disabled">
          Save
        </Button>,
      ),
    );
    expect(container.querySelector('button')?.disabled).toBe(true);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
