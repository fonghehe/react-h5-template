import { expect, it, vi } from 'vitest';

import { ApiError } from '@rh5/api-client';
import { createQueryClient } from '../query-client';

it.each([400, 401, 403, 404, 200, 0, 429, 503])(
  'only retries transient API failures (%s)',
  async (status) => {
    const client = createQueryClient();
    try {
      const queryFn = vi
        .fn<() => Promise<never>>()
        .mockRejectedValue(new ApiError('Failed', status));
      await expect(
        client.fetchQuery({ queryKey: ['audit', status], queryFn, retryDelay: 0 }),
      ).rejects.toBeInstanceOf(ApiError);
      expect(queryFn).toHaveBeenCalledTimes(
        status === 0 || status === 429 || status >= 500 ? 2 : 1,
      );
    } finally {
      client.clear();
    }
  },
);
