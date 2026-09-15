import { supportedLocales, type ApiEnvelope, type Locale } from '@rh5/contracts';

const localeSet = new Set<Locale>(supportedLocales);

const serverMessages = {
  invalidCredentials: {
    'en-US': 'Incorrect username or password',
    'ja-JP': 'ユーザー名またはパスワードが正しくありません',
    'zh-CN': '用户名或密码错误',
    'zh-HK': '用戶名或密碼錯誤',
    'zh-TW': '使用者名稱或密碼錯誤',
  },
  invalidRequest: {
    'en-US': 'Invalid request parameters',
    'ja-JP': 'リクエストパラメーターが正しくありません',
    'zh-CN': '请求参数错误',
    'zh-HK': '請求參數錯誤',
    'zh-TW': '請求參數錯誤',
  },
  invalidToken: {
    'en-US': 'The sign-in credential is invalid or expired',
    'ja-JP': 'ログイン情報が無効か期限切れです',
    'zh-CN': '无效或已过期的登录凭证',
    'zh-HK': '登入憑證無效或已過期',
    'zh-TW': '登入憑證無效或已過期',
  },
  loginSuccess: {
    'en-US': 'Signed in successfully',
    'ja-JP': 'ログインしました',
    'zh-CN': '登录成功',
    'zh-HK': '登入成功',
    'zh-TW': '登入成功',
  },
  logoutSuccess: {
    'en-US': 'Signed out',
    'ja-JP': 'ログアウトしました',
    'zh-CN': '已退出',
    'zh-HK': '已登出',
    'zh-TW': '已登出',
  },
  productNotFound: {
    'en-US': 'Product not found',
    'ja-JP': '商品が見つかりません',
    'zh-CN': '商品不存在',
    'zh-HK': '商品不存在',
    'zh-TW': '找不到商品',
  },
  sessionExpired: {
    'en-US': 'Your sign-in session has expired',
    'ja-JP': 'ログインセッションの有効期限が切れました',
    'zh-CN': '登录状态已失效',
    'zh-HK': '登入狀態已失效',
    'zh-TW': '登入狀態已失效',
  },
  userNotFound: {
    'en-US': 'User not found',
    'ja-JP': 'ユーザーが見つかりません',
    'zh-CN': '用户不存在',
    'zh-HK': '用戶不存在',
    'zh-TW': '找不到使用者',
  },
} as const;

export type ServerMessageKey = keyof typeof serverMessages;

export function localeFrom(request: Request): Locale {
  const preferences = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((entry) => {
      const [tag, quality] = entry.trim().split(';q=');
      const weight = quality === undefined ? 1 : Number(quality);
      return { tag: tag?.toLowerCase(), weight: Number.isFinite(weight) ? weight : 0 };
    })
    .filter((entry) => entry.weight > 0 && entry.weight <= 1)
    .toSorted((left, right) => right.weight - left.weight);
  for (const { tag } of preferences) {
    const exact = supportedLocales.find((locale) => locale.toLowerCase() === tag);
    if (exact && localeSet.has(exact)) return exact;
    if (tag === 'en' || tag?.startsWith('en-')) return 'en-US';
    if (tag === 'ja' || tag?.startsWith('ja-')) return 'ja-JP';
    if (tag === 'zh' || tag?.startsWith('zh-')) return 'zh-CN';
  }
  return 'zh-CN';
}

export function serverText(request: Request, key: ServerMessageKey) {
  return serverMessages[key][localeFrom(request)];
}

export function requestId(request: Request) {
  const supplied = request.headers.get('x-request-id');
  return supplied &&
    /^[a-f0-9-]{36}$/i.test(supplied) &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(supplied)
    ? supplied
    : crypto.randomUUID();
}

export function ok<T>(request: Request, data: T, message = 'ok') {
  return Response.json({
    code: 0,
    data,
    message,
    requestId: requestId(request),
  } satisfies ApiEnvelope<T>);
}

export function fail(request: Request, status: number, message: string, code = status) {
  return Response.json({ code, data: null, message, requestId: requestId(request) }, { status });
}
