import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const mockServer = setupServer(
  http.get('/api/products', () =>
    HttpResponse.json({
      code: 0,
      data: { items: [], page: 1, pageSize: 10, total: 0, hasMore: false },
      message: 'ok',
      requestId: 'test-request-id',
    }),
  ),
);
