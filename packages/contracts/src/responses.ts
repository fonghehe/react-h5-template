import { z } from 'zod';

// Allow additive fields while checking the data used by existing consumers.
export const userResponseSchema = z.looseObject({
  id: z.number().int(),
  username: z.string(),
  realName: z.string(),
  avatar: z.string(),
  roles: z.array(z.string()),
});

export const loginResponseSchema = userResponseSchema.extend({ accessToken: z.string() });

export const productResponseSchema = z.looseObject({
  id: z.number().int(),
  title: z.string(),
  imageUrl: z.string(),
  price: z.number(),
  memberPrice: z.number(),
  shopName: z.string(),
  shopBadge: z.string(),
  delivery: z.string(),
  description: z.string(),
});

export const productPageResponseSchema = z.looseObject({
  items: z.array(productResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  hasMore: z.boolean(),
});

export const logoutResponseSchema = z.null();

export const apiEnvelopeSchema = z.object({
  code: z.number(),
  requestId: z.string(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});
