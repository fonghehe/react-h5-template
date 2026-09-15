import { describe, expect, it } from 'vitest';

import { consumeSseChunk } from '../sse';

describe('consumeSseChunk', () => {
  it('keeps incomplete byte boundaries for the next read', () => {
    const first = consumeSseChunk('data: {"type":"delta","delta":"你"}\n\ndata: {"type"');
    expect(first.events).toEqual([{ type: 'delta', delta: '你' }]);
    expect(first.rest).toBe('data: {"type"');
  });

  it('ignores malformed provider events', () => {
    expect(consumeSseChunk('data: not-json\n\n').events).toEqual([]);
  });
});
