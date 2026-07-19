import { buildApiUrl } from '@config/api';
import { TwitchChatbot } from '@utils/twitchChatbot';

/**
 * Оборачивает URL ответа API в синтаксис выбранного чатбота.
 * @param url Полный URL эндпоинта.
 * @param chatbot Целевой чатбот.
 */
function wrapChatbotUrl(url: string, chatbot: TwitchChatbot): string {
  switch (chatbot) {
    case TwitchChatbot.Nightbot:
      return `$(urlfetch ${url})`;
    case TwitchChatbot.StreamElements:
    case TwitchChatbot.Fossabot:
      return `$(customapi ${url})`;
    case TwitchChatbot.StreamlabsChatbot:
      return `$readapi(${url})`;
    case TwitchChatbot.StreamlabsCloudBot:
      return `{readapi.${url}}`;
    case TwitchChatbot.Moobot:
      return url;
  }
}

/**
 * Собирает код ответа команды для выбранного чатбота.
 * @param path Путь API, например `/api/twitch/elo`.
 * @param nickname Ник FACEIT.
 * @param chatbot Целевой чатбот.
 * @returns Пустая строка, если ник пустой.
 */
export function buildChatbotCode(path: string, nickname: string, chatbot: TwitchChatbot): string {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return '';
  }
  const url = buildApiUrl(`${path}?nickname=${encodeURIComponent(trimmed)}`);
  return wrapChatbotUrl(url, chatbot);
}
