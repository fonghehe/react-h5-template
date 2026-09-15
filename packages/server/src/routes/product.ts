import { productIdSchema } from '@rh5/contracts';

import { fail, localeFrom, ok, serverText } from '../http';
import { findProduct } from '../repositories/catalog';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = productIdSchema.safeParse(id);
  if (!parsed.success) return fail(request, 400, serverText(request, 'invalidRequest'));
  const product = await findProduct(parsed.data, localeFrom(request));
  return product
    ? ok(request, product)
    : fail(request, 404, serverText(request, 'productNotFound'));
}
