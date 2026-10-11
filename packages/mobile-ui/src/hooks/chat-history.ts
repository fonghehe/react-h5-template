import { CHAT_MAX_CONTENT_LENGTH, CHAT_MAX_MESSAGES } from '@rh5/contracts';

export function chatContext<T extends { content: string }>(messages: T[]): T[] {
  // Preserve the greeting and newest complete turns; displayed history stays intact.
  const recent =
    messages.length > CHAT_MAX_MESSAGES
      ? [...messages.slice(0, 1), ...messages.slice(-(CHAT_MAX_MESSAGES - 1))]
      : messages;
  return recent.map((message) => ({
    ...message,
    content: message.content.slice(0, CHAT_MAX_CONTENT_LENGTH),
  }));
}
