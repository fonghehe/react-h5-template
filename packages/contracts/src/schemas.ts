import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少需要 6 位'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const chatSchema = z.object({
  message: z.string().trim().min(1, '请输入消息').max(1000, '消息不能超过 1000 字'),
});

export type ChatInput = z.infer<typeof chatSchema>;

export const productPageSchema = z.object({
  page: z.coerce.number<number>().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number<number>().int().min(1).max(20).default(10),
});

export const productIdSchema = z.coerce.number<number>().int().positive().max(2_147_483_647);

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        role: z.enum(['assistant', 'user']),
        content: z.string().max(1000),
      }),
    )
    .min(1)
    .max(30),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, '请输入收货人'),
  phone: z
    .string()
    .trim()
    .regex(/^1\d{10}$/, '请输入有效的手机号'),
  address: z.string().trim().min(5, '请输入完整地址'),
  payment: z.literal('wechat'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
