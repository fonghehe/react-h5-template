export interface SseEvent {
  type: 'delta' | 'finish' | 'start';
  delta?: string;
  id?: string;
}

export function consumeSseChunk(buffer: string) {
  const events: SseEvent[] = [];
  const blocks = buffer.split('\n\n');
  const rest = blocks.pop() ?? '';
  for (const block of blocks) {
    const data = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    if (!data || data === '[DONE]') continue;
    try {
      events.push(JSON.parse(data) as SseEvent);
    } catch {
      // Ignore malformed provider events without breaking the active conversation.
    }
  }
  return { events, rest };
}
