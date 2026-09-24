import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmDialog, NutuiFeedback, showToast } from '../feedback';

vi.mock('@nutui/nutui-react', () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const dialogMethods = ['showModal', 'close'] as const;
const descriptors = dialogMethods.map((method) =>
  Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, method),
);
beforeAll(() => {
  for (const method of dialogMethods) {
    Object.defineProperty(HTMLDialogElement.prototype, method, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = method === 'showModal';
      },
    });
  }
});
afterAll(() => {
  dialogMethods.forEach((method, index) => {
    const descriptor = descriptors[index];
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, method, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, method);
  });
});

describe('NutUI feedback host', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(<NutuiFeedback confirmText="Confirm" cancelText="Cancel" />));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('replaces a toast and gives the new toast its full duration', async () => {
    await act(async () => showToast('first'));
    await act(async () => vi.advanceTimersByTime(2000));
    await act(async () => showToast('<b>second</b>', 'success'));
    await act(async () => vi.advanceTimersByTime(1000));
    expect(container.querySelector('[role="status"]')?.textContent).toBe('<b>second</b>');
    expect(container.querySelector('b')).toBeNull();
    await act(async () => vi.advanceTimersByTime(2000));
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('resolves a confirmation through the rendered dialog', async () => {
    let result!: Promise<boolean>;
    await act(async () => {
      result = confirmDialog('Continue?');
    });
    await act(async () => container.querySelectorAll('button')[1].click());
    await expect(result).resolves.toBe(true);
    expect(container.querySelector('dialog')).toBeNull();
  });

  it('cancels a replaced dialog and settles pending confirmation on unmount', async () => {
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    await act(async () => {
      first = confirmDialog('first');
    });
    await act(async () => {
      second = confirmDialog('second');
    });
    await expect(first).resolves.toBe(false);
    await act(async () => root.render(null));
    await expect(second).resolves.toBe(false);
  });

  it('cancels confirmation with the native dialog cancel event', async () => {
    let result!: Promise<boolean>;
    await act(async () => {
      result = confirmDialog('Continue?');
    });
    await act(async () => {
      container
        .querySelector('dialog')
        ?.dispatchEvent(new Event('cancel', { cancelable: true, bubbles: true }));
    });
    await expect(result).resolves.toBe(false);
    expect(container.querySelector('dialog')).toBeNull();
  });
});
