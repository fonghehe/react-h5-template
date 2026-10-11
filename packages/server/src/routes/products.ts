import { productPageSchema } from '@rh5/contracts';

import { fail, localeFrom, ok, serverText, withApiErrors } from '../http';
import { listProducts } from '../repositories/catalog';

export const GET = withApiErrors(async (request: Request) => {
  const url = new URL(request.url);
  const parsed = productPageSchema.safeParse({
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
  });
  if (!parsed.success) return fail(request, 400, serverText(request, 'invalidRequest'));
  return ok(
    request,
    await listProducts(localeFrom(request), parsed.data.page, parsed.data.pageSize),
  );
});
