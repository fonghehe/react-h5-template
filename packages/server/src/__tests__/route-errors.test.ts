import { afterEach, describe, expect, it, vi } from 'vitest';

import { listProducts, findProduct } from '../repositories/catalog';
import { authenticateUser, findUser } from '../repositories/users';
import { createAccessToken, verifyAccessToken } from '../auth';
import { GET as products } from '../routes/products';
import { GET as product } from '../routes/product';
import { POST as login } from '../routes/login';
import { GET as user } from '../routes/user';

vi.mock('server-only', () => ({}));
vi.mock('../repositories/catalog', () => ({
  listProducts: vi.fn<typeof listProducts>(),
  findProduct: vi.fn<typeof findProduct>(),
}));
vi.mock('../repositories/users', () => ({
  authenticateUser: vi.fn<typeof authenticateUser>(),
  findUser: vi.fn<typeof findUser>(),
}));
vi.mock('../auth', () => ({
  createAccessToken: vi.fn<typeof createAccessToken>(),
  verifyAccessToken: vi.fn<typeof verifyAccessToken>(),
}));

afterEach(() => vi.restoreAllMocks());

describe('route exception boundary', () => {
  it.each(['products', 'product', 'login', 'user', 'token'] as const)(
    'normalizes %s failures without leaking internal details',
    async (route) => {
      const trace = '550e8400-e29b-41d4-a716-446655440000';
      const request = new Request('http://localhost/api/' + route, {
        method: route === 'login' || route === 'token' ? 'POST' : 'GET',
        headers: {
          'Accept-Language': 'en-US',
          'X-Request-ID': trace,
          Authorization: 'Bearer token',
        },
        ...(route === 'login' || route === 'token'
          ? { body: JSON.stringify({ username: 'user', password: '123456' }) }
          : {}),
      });
      const error = new Error('private connection details');
      const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      vi.mocked(verifyAccessToken).mockReturnValue({ sub: 1 });
      vi.mocked(listProducts).mockRejectedValue(error);
      vi.mocked(findProduct).mockRejectedValue(error);
      vi.mocked(findUser).mockRejectedValue(error);
      vi.mocked(authenticateUser).mockRejectedValue(error);
      if (route === 'token') {
        vi.mocked(authenticateUser).mockResolvedValue({
          id: 1,
          username: 'user',
          realName: '',
          avatar: '',
          roles: [],
        });
        vi.mocked(createAccessToken).mockImplementation(() => {
          throw error;
        });
      }
      const response = await (route === 'products'
        ? products(request)
        : route === 'product'
          ? product(request, { params: Promise.resolve({ id: '1' }) })
          : route === 'user'
            ? user(request)
            : login(request));
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        code: 500,
        data: null,
        message: 'An unexpected server error occurred',
        requestId: trace,
      });
      expect(log).toHaveBeenCalledWith(
        'API request failed',
        expect.objectContaining({ requestId: trace, error }),
      );
    },
  );
});
