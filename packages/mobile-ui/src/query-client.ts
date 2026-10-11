import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@rh5/api-client';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          failureCount < 1 &&
          (!(error instanceof ApiError) ||
            error.status === 0 ||
            error.status === 429 ||
            error.status >= 500),
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}
