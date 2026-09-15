import { ok, serverText } from '../http';

export async function POST(request: Request) {
  return ok(request, null, serverText(request, 'logoutSuccess'));
}
