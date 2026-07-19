import { buildApiUrl } from '@config/api';
import { TwitchChatbot } from '@utils/twitchChatbot';

const ELO_FIELD_NAMES = new Set([ 'elo', 'level' ]);

/**
 * Оборачивает URL ответа API в синтаксис выбранного чатбота.
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

function buildFieldUrl(nickname: string, field: string): string {
  const params = new URLSearchParams({ nickname, name: field });
  return buildApiUrl(`/api/twitch/field?${params.toString()}`);
}

function buildEloMessageUrl(nickname: string, text: string): string {
  const params = new URLSearchParams({ nickname, text });
  return buildApiUrl(`/api/twitch/elo?${params.toString()}`);
}

function buildStatsUrl(nickname: string): string {
  const params = new URLSearchParams({ nickname });
  return buildApiUrl(`/api/twitch/stats?${params.toString()}`);
}

interface BuildEloChatbotCodeInput {
  nickname: string;
  chatbot: TwitchChatbot;
  /** Шаблон с `{elo}` / `{level}`. */
  text: string;
}

interface BuildStatsChatbotCodeInput {
  nickname: string;
  chatbot: TwitchChatbot;
}

/**
 * Код команды !elo: текст пользователя + urlfetch сырых значений (Moobot — один URL).
 */
export function buildEloChatbotCode(input: BuildEloChatbotCodeInput): string {
  const nickname = input.nickname.trim();
  const text = input.text.trim();
  if (!nickname || !text) {
    return '';
  }

  if (input.chatbot === TwitchChatbot.Moobot) {
    return buildEloMessageUrl(nickname, text);
  }

  return text.replace(/\{([a-zA-Z]+)\}/g, (match, field: string) => {
    if (!ELO_FIELD_NAMES.has(field)) {
      return match;
    }
    return wrapChatbotUrl(buildFieldUrl(nickname, field), input.chatbot);
  });
}

/**
 * Код команды !stats: один запрос готовой строки статистики.
 */
export function buildStatsChatbotCode(input: BuildStatsChatbotCodeInput): string {
  const nickname = input.nickname.trim();
  if (!nickname) {
    return '';
  }
  return wrapChatbotUrl(buildStatsUrl(nickname), input.chatbot);
}
