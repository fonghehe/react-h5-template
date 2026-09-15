import { loginSchema } from '@rh5/contracts';

import { createAccessToken } from '../auth';
import { fail, ok, serverText } from '../http';
import { authenticateUser } from '../repositories/users';

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(request, 400, serverText(request, 'invalidRequest'));
  const user = await authenticateUser(parsed.data.username, parsed.data.password);
  if (!user) return fail(request, 403, serverText(request, 'invalidCredentials'));
  return ok(
    request,
    { ...user, accessToken: createAccessToken(user.id) },
    serverText(request, 'loginSuccess'),
  );
}
