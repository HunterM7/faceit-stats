import { buildApiUrl } from '@config/api';

/**
 * Собирает код Nightbot `$(urlfetch …)` для GET-эндпоинта Twitch-команд.
 * @param path Путь API, например `/api/twitch/elo`.
 * @param nickname Ник FACEIT.
 * @returns Пустая строка, если ник пустой.
 */
export function buildNightbotCode(path: string, nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return '';
  }
  const url = buildApiUrl(`${path}?nickname=${encodeURIComponent(trimmed)}`);
  return `$(urlfetch ${url})`;
}
