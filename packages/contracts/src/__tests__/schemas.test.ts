import { describe, expect, it } from 'vitest';

import { chatRequestSchema, loginSchema, productIdSchema, productPageSchema } from '../schemas';

describe('loginSchema', () => {
  it('accepts the documented demo account', () => {
    expect(loginSchema.parse({ username: 'user', password: '123456' })).toEqual({
      username: 'user',
      password: '123456',
    });
  });

  it('rejects short passwords', () => {
    expect(loginSchema.safeParse({ username: 'user', password: '123' }).success).toBe(false);
  });
});

describe('request boundary schemas', () => {
  it('rejects malformed pagination and identifiers instead of coercing them', () => {
    expect(productPageSchema.safeParse({ page: '1junk', pageSize: '4' }).success).toBe(false);
    expect(productPageSchema.safeParse({ page: '-1', pageSize: '4' }).success).toBe(false);
    expect(productIdSchema.safeParse('Infinity').success).toBe(false);
    expect(productIdSchema.safeParse('1.5').success).toBe(false);
    expect(productPageSchema.parse({})).toEqual({ page: 1, pageSize: 10 });
  });

  it('caps chat history and individual messages before streaming', () => {
    const valid = { messages: [{ id: '1', role: 'user', content: 'Hi' }] };
    expect(chatRequestSchema.safeParse(valid).success).toBe(true);
    expect(
      chatRequestSchema.safeParse({ messages: Array(31).fill(valid.messages[0]) }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        messages: [{ ...valid.messages[0], content: 'x'.repeat(1001) }],
      }).success,
    ).toBe(false);
  });
});
