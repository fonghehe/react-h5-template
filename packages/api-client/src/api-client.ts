import type {
  ApiEnvelope,
  Locale,
  LoginInput,
  LoginResult,
  Product,
  ProductPage,
  User,
} from '@rh5/contracts';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  locale?: Locale;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { locale = 'zh-CN', token, ...init } = options;
  if (!path.startsWith('/api/')) {
    throw new ApiError(
      locale === 'en-US'
        ? 'API URLs must use same-origin relative paths'
        : locale === 'ja-JP'
          ? 'API URL には同一オリジンの相対パスを使用してください'
          : 'API 地址必须使用站内相对路径',
      0,
    );
  }
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Accept-Language', locale);
  headers.set('X-Request-ID', crypto.randomUUID());
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const currentRequestId = headers.get('X-Request-ID') ?? undefined;
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError('Network request failed', 0, currentRequestId);
  }
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!payload || typeof payload.code !== 'number' || typeof payload.requestId !== 'string') {
    throw new ApiError('Invalid API response', response.status, currentRequestId);
  }
  if (!response.ok || payload.code !== 0) {
    throw new ApiError(
      payload.message ||
        (locale === 'en-US'
          ? 'Request failed'
          : locale === 'ja-JP'
            ? 'リクエストに失敗しました'
            : '请求失败'),
      response.status,
      payload.requestId,
    );
  }
  return payload.data;
}

export const api = {
  login: (body: LoginInput, locale: Locale) =>
    request<LoginResult>('/api/auth/login', {
      body: JSON.stringify(body),
      locale,
      method: 'POST',
    }),
  logout: (locale: Locale) => request<null>('/api/auth/logout', { locale, method: 'POST' }),
  user: (token: string, locale: Locale) => request<User>('/api/user', { locale, token }),
  products: (params: { locale: Locale; page?: number; pageSize?: number }) => {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
    });
    return request<ProductPage>(`/api/products?${search}`, { locale: params.locale });
  },
  product: (id: string, locale: Locale) => request<Product>(`/api/products/${id}`, { locale }),
};
