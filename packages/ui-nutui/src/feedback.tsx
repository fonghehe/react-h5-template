'use client';

import { Button } from '@nutui/nutui-react';
import { useEffect, useId, useRef, useSyncExternalStore } from 'react';

interface Feedback {
  toast: { message: string; tone?: 'error' | 'success' } | null;
  dialog: { message: string; resolve: (confirmed: boolean) => void } | null;
}

const empty: Feedback = { toast: null, dialog: null };
let snapshot = empty;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => snapshot;
const getServerSnapshot = () => empty;
const update = (next: Feedback) => {
  snapshot = next;
  listeners.forEach((listener) => listener());
};

export function showToast(message: string, tone?: 'error' | 'success') {
  update({ ...snapshot, toast: { message, tone } });
}

export function confirmDialog(message: string) {
  snapshot.dialog?.resolve(false);
  return new Promise<boolean>((resolve) => {
    update({ ...snapshot, dialog: { message, resolve } });
  });
}

function complete(dialog: Feedback['dialog'], confirmed: boolean) {
  if (!dialog || snapshot.dialog !== dialog) return;
  update({ ...snapshot, dialog: null });
  dialog.resolve(confirmed);
}

// Render feedback inside ConfigProvider instead of NutUI's legacy ReactDOM.render helpers.
export function NutuiFeedback({
  confirmText,
  cancelText,
}: {
  confirmText: string;
  cancelText: string;
}) {
  const { toast, dialog } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messageId = useId();

  useEffect(() => {
    const node = dialogRef.current;
    if (!dialog || !node) return undefined;
    node.showModal();
    return () => node.close();
  }, [dialog]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => {
      if (snapshot.toast === toast) update({ ...snapshot, toast: null });
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(
    () => () => {
      const pending = snapshot.dialog;
      update(empty);
      pending?.resolve(false);
    },
    [],
  );

  return (
    <>
      {toast && (
        <div className="rh5-nutui-toast" role={toast.tone === 'error' ? 'alert' : 'status'}>
          {toast.message}
        </div>
      )}
      {dialog && (
        <dialog
          ref={dialogRef}
          className="rh5-nutui-dialog"
          aria-labelledby={messageId}
          onCancel={(event) => {
            event.preventDefault();
            complete(dialog, false);
          }}
        >
          <p id={messageId}>{dialog.message}</p>
          <div className="rh5-nutui-dialog-actions">
            <Button onClick={() => complete(dialog, false)}>{cancelText}</Button>
            <Button type="primary" onClick={() => complete(dialog, true)}>
              {confirmText}
            </Button>
          </div>
        </dialog>
      )}
    </>
  );
}
