'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { useCartStore, useSessionStore } from '@rh5/stores';

import { UiProvider, type UiKit } from './ui';

export function AppProviders({ children, kit }: { children: ReactNode; kit: UiKit }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  const locale = useSessionStore((state) => state.locale);

  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useSessionStore.persist.rehydrate();
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
