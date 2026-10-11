'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { useCartStore, useSessionStore } from '@rh5/stores';

import { UiProvider, type UiKit } from './ui';
import { createQueryClient } from './query-client';

export function AppProviders({ children, kit }: { children: ReactNode; kit: UiKit }) {
  const [queryClient] = useState(createQueryClient);
  const locale = useSessionStore((state) => state.locale);

  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useSessionStore.persist.rehydrate();
    document.documentElement.dataset.hydrated = 'true';
    return () => {
      delete document.documentElement.dataset.hydrated;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const KitProvider = kit.Provider;
  return (
    <UiProvider kit={kit}>
      <KitProvider locale={locale}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </KitProvider>
    </UiProvider>
  );
}
