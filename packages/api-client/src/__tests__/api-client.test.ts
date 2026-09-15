import { afterEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError } from '../api-client';

afterEach(() => vi.unstubAllGlobals());

describe('API response boundary', () => {
  it('rejects an HTML error response with a traceable error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>error</html>', { status: 502 })),
    );
    await expect(api.products({ locale: 'en-US' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
    });
  });

  it('does not treat a missing envelope as successful data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ items: [] })));
    await expect(api.products({ locale: 'en-US' })).rejects.toBeInstanceOf(ApiError);
  });
});
