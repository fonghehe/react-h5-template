import { verifyAccessToken } from '../auth';
import { fail, ok, serverText } from '../http';
import { findUser } from '../repositories/users';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return fail(request, 401, serverText(request, 'sessionExpired'));
  const claims = verifyAccessToken(token);
  if (!claims) return fail(request, 401, serverText(request, 'invalidToken'));
  const user = await findUser(claims.sub);
  return user ? ok(request, user) : fail(request, 401, serverText(request, 'userNotFound'));
}
