import { afterEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError } from '../api-client';

afterEach(() => vi.unstubAllGlobals());

describe('API response boundary', () => {
  it('forwards cancellation and preserves request headers for catalog queries', async () => {
    const controller = new AbortController();
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async () =>
        Response.json({ code: 0, data: {}, message: 'ok', requestId: 'server-id' }),
      );
    vi.stubGlobal('fetch', fetch);

    await api.products({ locale: 'ja-JP', page: 2, pageSize: 4 }, controller.signal);
    await api.product('7', 'ja-JP', controller.signal);

    expect(fetch.mock.calls.map(([path]) => path)).toEqual([
      '/api/products?page=2&pageSize=4',
      '/api/products/7',
    ]);
    for (const [, options] of fetch.mock.calls) {
      expect(options?.signal).toBe(controller.signal);
      expect(new Headers(options?.headers).get('Accept-Language')).toBe('ja-JP');
      expect(new Headers(options?.headers).get('X-Request-ID')).toBeTruthy();
    }
  });

  it('preserves an abort reason instead of reporting a network failure', async () => {
    const controller = new AbortController();
    const error = new DOMException('Cancelled', 'AbortError');
    controller.abort(error);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    await expect(api.products({ locale: 'en-US' }, controller.signal)).rejects.toBe(error);
  });

  it('still normalizes ordinary network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Offline')));

    await expect(api.products({ locale: 'en-US' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Network request failed',
      status: 0,
      requestId: expect.any(String),
    });
  });

  it('preserves cancellation while reading the response body', async () => {
    const controller = new AbortController();
    const error = new DOMException('Body cancelled', 'AbortError');
    const response = new Response();
    vi.spyOn(response, 'json').mockImplementation(async () => {
      controller.abort(error);
      throw error;
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(api.product('1', 'en-US', controller.signal)).rejects.toBe(error);
  });

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
