import { afterEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError } from '../api-client';

const product = {
  id: 7,
  title: 'Product',
  description: '',
  imageUrl: '',
  price: 10,
  memberPrice: 8,
  shopName: '',
  shopBadge: '',
  delivery: '',
};

afterEach(() => vi.unstubAllGlobals());

describe('API response boundary', () => {
  it('forwards cancellation and preserves request headers for catalog queries', async () => {
    const controller = new AbortController();
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (path) =>
      Response.json({
        code: 0,
        data:
          typeof path === 'string' && path.includes('?')
            ? { items: [product], page: 2, pageSize: 4, total: 7, hasMore: false }
            : product,
        message: 'ok',
        requestId: 'server-id',
      }),
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

  it.each([
    null,
    {},
    { items: null },
    { items: [{ ...product, price: '10' }], page: 1, pageSize: 4, total: 1, hasMore: false },
  ])('rejects malformed successful product pages: %j', async (data) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ code: 0, data, requestId: 'server-id' })),
    );
    await expect(api.products({ locale: 'en-US' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 200,
      requestId: 'server-id',
    });
  });

  it('rejects a successful login without a token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          code: 0,
          requestId: 'server-id',
          data: { id: 1, username: 'user', realName: 'User', avatar: '', roles: [] },
        }),
      ),
    );
    await expect(
      api.login({ username: 'user', password: '123456' }, 'en-US'),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('keeps valid data and accepts additional response fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ code: 0, requestId: 'server-id', data: { ...product, future: true } }),
        ),
    );
    await expect(api.product('7', 'en-US')).resolves.toMatchObject(product);
  });
});
