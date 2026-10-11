import {
  apiEnvelopeSchema,
  loginResponseSchema,
  logoutResponseSchema,
  productPageResponseSchema,
  productResponseSchema,
  userResponseSchema,
  type Locale,
  type LoginInput,
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

interface ResponseSchema<T> {
  safeParse: (value: unknown) => { success: true; data: T } | { success: false };
}

async function request<T>(
  path: string,
  schema: ResponseSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
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
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError('Network request failed', 0, currentRequestId);
  }
  const decoded: unknown = await response.json().catch((error: unknown) => {
    if (init.signal?.aborted) throw error;
    return null;
  });
  const envelope = apiEnvelopeSchema.safeParse(decoded);
  if (!envelope.success) {
    throw new ApiError('Invalid API response', response.status, currentRequestId);
  }
  const payload = envelope.data;
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
  const result = schema.safeParse(payload.data);
  if (!result.success)
    throw new ApiError('Invalid API response', response.status, payload.requestId);
  return result.data;
}

export const api = {
  login: (body: LoginInput, locale: Locale) =>
    request('/api/auth/login', loginResponseSchema, {
      body: JSON.stringify(body),
      locale,
      method: 'POST',
    }),
  logout: (locale: Locale) =>
    request('/api/auth/logout', logoutResponseSchema, { locale, method: 'POST' }),
  user: (token: string, locale: Locale) =>
    request('/api/user', userResponseSchema, { locale, token }),
  products: (
    params: { locale: Locale; page?: number; pageSize?: number },
    signal?: AbortSignal,
  ) => {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
    });
    return request(`/api/products?${search}`, productPageResponseSchema, {
      locale: params.locale,
      signal,
    });
  },
  product: (id: string, locale: Locale, signal?: AbortSignal) =>
    request(`/api/products/${id}`, productResponseSchema, { locale, signal }),
};
