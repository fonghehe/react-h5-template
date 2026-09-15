import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_PREFIX = 'h5';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('生产环境必须配置 AUTH_SECRET');
  }
  return 'react-h5-template-local-development-secret';
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createAccessToken(userId: number) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS, sub: userId }),
  ).toString('base64url');
  return `${TOKEN_PREFIX}.${payload}.${signature(payload)}`;
}

export function verifyAccessToken(token: string): { sub: number } | null {
  const [prefix, payload, suppliedSignature] = token.split('.');
  if (prefix !== TOKEN_PREFIX || !payload || !suppliedSignature) return null;

  const expectedSignature = signature(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  if (
    expectedBuffer.length !== suppliedBuffer.length ||
    !timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      exp?: number;
      sub?: number;
    };
    if (!claims.sub || !claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return { sub: claims.sub };
  } catch {
    return null;
  }
}
