import { describe, expect, it } from 'vitest';

import { fail, localeFrom, requestId } from '../http';

describe('shared HTTP boundary', () => {
  it('selects the highest-quality supported language', () => {
    const request = new Request('http://localhost/api/products', {
      headers: { 'Accept-Language': 'fr-FR,ja;q=0.9,en-US;q=0.5' },
    });
    expect(localeFrom(request)).toBe('ja-JP');
  });

  it('keeps valid trace IDs and replaces malformed ones', async () => {
    const valid = '550e8400-e29b-41d4-a716-446655440000';
    expect(
      requestId(new Request('http://localhost/', { headers: { 'X-Request-ID': valid } })),
    ).toBe(valid);
    const request = new Request('http://localhost/', {
      headers: { 'X-Request-ID': 'bad\nvalue'.replace('\n', ' ') },
    });
    const response = fail(request, 400, 'Invalid request');
    const payload = await response.json();
    expect(payload.requestId).toMatch(/^[a-f0-9-]{36}$/i);
    expect(payload.requestId).not.toBe('bad value');
    expect(response.status).toBe(400);
  });
});
