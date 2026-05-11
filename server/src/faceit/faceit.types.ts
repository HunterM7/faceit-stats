/** Типы ответов FACEIT Data API v4 для `FaceitService`. */

export interface PlayerGameData {
  faceit_elo?: number;
  skill_level?: number;
  /** Регион матчмейкинга для игры (например `EU`), нужен для Rankings API. */
  region?: string;
}

/** Ответ `GET /rankings/games/.../regions/.../players/...`. */
export interface PlayerGlobalRankingItem {
  country?: string;
  faceit_elo?: number;
  game_skill_level?: number;
  nickname?: string;
  player_id?: string;
  position?: number;
}

export interface PlayerGlobalRankingResponse {
  start?: number;
  end?: number;
  position?: number;
  items?: PlayerGlobalRankingItem[];
}

export interface PlayerResponse {
  player_id?: string;
  nickname?: string;
  country?: string;
  games?: Record<string, PlayerGameData>;
}

export interface MatchPlayer {
  player_id: string;
  nickname?: string;
}

export interface MatchTeam {
  players?: MatchPlayer[];
}

export interface MatchHistoryItem {
  match_id?: string;
  game_id?: string;
  status?: string;
  finished_at?: number;
  started_at?: number;
  results?: {
    winner?: string;
    score?: Record<string, number>;
  };
  teams?: Record<string, MatchTeam>;
}

export interface MatchHistoryResponse {
  items?: MatchHistoryItem[];
}

export interface InternalMatchStatsItem {
  stats?: Record<string, string>;
}

export interface InternalMatchStatsResponse {
  items?: InternalMatchStatsItem[];
}

/** Ответ `GET /players/{player_id}/stats/{game_id}`. */
export interface PlayerGameStatsResponse {
  /** Идентификатор игрока. */
  player_id: string;
  /** Идентификатор игры. */
  game_id: 'cs2';
  /** Общая статистика игрока за всё время. */
  lifetime: {
    /** Наибольшая серия побед (пример: '14'). */
    'Longest Win Streak': `${number}`;
    /** Общее количество урона от гранат (пример: '114638'). */
    'Total Utility Damage': `${number}`;
    /** Средний процент попаданий в голову (пример: '46'). */
    'Average Headshots %': `${number}`;
    /** Процент побед в 1v2 (пример: '0.19'). */
    '1v2 Win Rate': `${number}`;
    /** Средний урон за раунд от гранат (пример: '2.81'). */
    'Utility Damage per Round': `${number}`;
    /** Значение убийств из снайперской винтовки (пример: '0.23'). */
    'Sniper Kill Rate': `${number}`;
    /** Общее количество матчей (пример: '1846'). */
    'Total Matches': `${number}`;
    /** Общее количество использованых гранат (пример: '12783'). */
    'Total Utility Count': `${number}`;
    /** Общее количество убийств с расширенной статистикой (пример: '31376'). */
    'Total Kills with extended stats': `${number}`;
    /** (пример: '8506'). */
    'Total Entry Count': `${number}`;
    /** Общее количество успешных использованых гранат (пример: '3963'). */
    'Total Utility Successes': `${number}`;
    /** Общее количество побед (пример: '2423'). */
    'Wins': `${number}`;
    /** (пример: '0.57'). */
    'Entry Success Rate': `${number}`;
    /** Среднее количество использованых флешек за раунд (пример: '0.33'). */
    'Flashes per Round': `${number}`;
    /** Общее количество попаданий в голову (пример: '213754'). */
    'Total Headshots %': `${number}`;
    /** Результаты последних 5 матчей (пример: ['1', '0', '1', '0', '1']). */
    'Recent Results': [ '1' | '0', '1' | '0', '1' | '0', '1' | '0', '1' | '0'];
    /** Среднее количество убийств из снайперской винтовки за раунд (пример: '0.3'). */
    'Sniper Kill Rate per Round': `${number}`;
    /** (пример: '4876'). */
    'Total Entry Wins': `${number}`;
    /** Процент побед в 1v1 (пример: '0.37'). */
    '1v1 Win Rate': `${number}`;
    /** Процент успешных использованых флешек (пример: '0.48'). */
    'Flash Success Rate': `${number}`;
    /** Среднее количество ослепленных врагов за раунд (пример: '0.23'). */
    'Enemies Flashed per Round': `${number}`;
    /** Среднее соотношение убийств к смертям (пример: '1.24'). */
    'Average K/D Ratio': `${number}`;
    /** Общее количество раундов с расширенной статистикой (пример: '40751'). */
    'Total Rounds with extended stats': `${number}`;
    /** Общее количество ослепленных врагов (пример: '9434'). */
    'Total Enemies Flashed': `${number}`;
    /** Процент побед (пример: '52'). */
    'Win Rate %': `${number}`;
    /** (пример: '5794.09'). */
    'K/D Ratio': `${number}`;
    /** Среднее количество нанесенного урона за раунд (пример: '81.16'). */
    'ADR': `${number}`;
    /** Процент успешных использованых гранат (пример: '0.31'). */
    'Utility Success Rate': `${number}`;
    /** Общее количество матчей (пример: '4672'). */
    'Matches': `${number}`;
    /** Текущая серия побед (пример: '5'). */
    'Current Win Streak': `${number}`;
    /** (пример: '0.21'). */
    'Entry Rate': `${number}`;
    /** Общее количество использованых флешек (пример: '13307'). */
    'Total Flash Count': `${number}`;
    /** Общее количество убийств из снайперской винтовки (пример: '9259'). */
    'Total Sniper Kills': `${number}`;
    /** Общее количество нанесенного урона (пример: '3307520'). */
    'Total Damage': `${number}`;
    /** Общее количество ситуаций в 1v1 (пример: '1234'). */
    'Total 1v1 Count': `${number}`;
    /** Общее количество побед в ситуациях 1v1 (пример: '451'). */
    'Total 1v1 Wins': `${number}`;
    /** Общее количество ситуаций в 1v2 (пример: '1485'). */
    'Total 1v2 Count': `${number}`;
    /** Общее количество побед в ситуациях 1v2 (пример: '277'). */
    'Total 1v2 Wins': `${number}`;
    /** Среднее количество использованых гранат за раунд (пример: '0.31'). */
    'Utility Usage per Round': `${number}`;
    /** Процент успешных использованых гранат (пример: '8.97'). */
    'Utility Damage Success Rate': `${number}`;
    /** Общее количество успешных использованых флешек (пример: '6435'). */
    'Total Flash Successes': `${number}`;
  };
  /** Последние 10 игр. */
  segments: [ Segment, Segment, Segment, Segment, Segment, Segment, Segment, Segment, Segment, Segment ];
}

interface Segment {
  /** Тип события. */
  type: 'Map';
  /** Режим игры. */
  mode: '5v5';
  /** Название карты. */
  label: 'Mirage';
  /** Изображение карты в маленьком размере. */
  img_small: string;
  /** Изображение карты в обычном размере. */
  img_regular: string;
  /** Статистика за игру. */
  stats: {
    /** (пример: '0.2'). */
    'Entry Rate': `${number}`;
    /** Общее количество урона от гранат (пример: '30036'). */
    'Total Utility Damage': `${number}`;
    /** Среднее количество убийств за раунд (пример: '0.74'). */
    'Average K/R Ratio': `${number}`;
    /** Общее количество матчей (пример: '513'). */
    'Total Matches': `${number}`;
    /** Общее количество успешных использованых гранат (пример: '1079'). */
    'Total Utility Successes': `${number}`;
    /** Процент успешных использованых гранат (пример: '0.29'). */
    'Utility Success Rate': `${number}`;
    /** (пример: '1264'). */
    'Total Entry Wins': `${number}`;
    /** Процент успешных использованых флешек (пример: '0.47'). */
    'Flash Success Rate': `${number}`;
    /** Среднее количество нанесенного урона за раунд (пример: '79.07'). */
    'ADR': `${number}`;
    /** Общее количество использованых гранат (пример: '3709'). */
    'Total Utility Count': `${number}`;
    /** Среднее количество четверных убийств за раунд (пример: '0.16'). */
    'Average Quadro Kills': `${number}`;
    /** Процент побед в 1v1 (пример: '0.36'). */
    '1v1 Win Rate': `${number}`;
    /** Общее количество смертей (пример: '10554'). */
    'Deaths': `${number}`;
    /** Среднее количество ассистов за раунд (пример: '3.88'). */
    'Average Assists': `${number}`;
    /** Среднее количество смертей за раунд (пример: '14.84'). */
    'Average Deaths': `${number}`;
    /** Общее количество нанесенного урона (пример: '895263'). */
    'Total Damage': `${number}`;
    /** Среднее количество голов за матч (пример: '7.53'). */
    'Headshots per Match': `${number}`;
    /** Общее количество убийств из снайперской винтовки (пример: '2304'). */
    'Total Sniper Kills': `${number}`;
    /** Общее количество ассистов (пример: '2762'). */
    'Assists': `${number}`;
    /** Общее количество попаданий в голову (пример: '33700'). */
    'Total Headshots %': `${number}`;
    /** Общее количество MVP (пример: '1551'). */
    'MVPs': `${number}`;
    /** Процент побед в 1v2 (пример: '0.18'). */
    '1v2 Win Rate': `${number}`;
    /** Среднее количество ослепленных врагов за раунд (пример: '0.2'). */
    'Enemies Flashed per Round': `${number}`;
    /** Общее количество использованых флешек (пример: '3130'). */
    'Total Flash Count': `${number}`;
    /** Среднее количество MVP за матч (пример: '2.18'). */
    'Average MVPs': `${number}`;
    /** Общее количество убийств с расширенной статистикой (пример: '8498'). */
    'Total Kills with extended stats': `${number}`;
    /** Среднее соотношение убийств к смертям (пример: 1.17). */
    'Average K/D Ratio': `${number}`;
    /** Среднее количество тройных убийств за раунд (пример: '0.87'). */
    'Average Triple Kills': `${number}`;
    /** (пример: '524.09'). */
    'K/R Ratio': `${number}`;
    /** Среднее количество использованых флешек за раунд (пример: '0.28'). */
    'Flashes per Round': `${number}`;
    /** Среднее количество пятикратных убийств за раунд (пример: '0.01'). */
    'Average Penta Kills': `${number}`;
    /** Общее количество пятикратных убийств (пример: '9'). */
    'Penta Kills': `${number}`;
    /** Общее количество побед в ситуациях 1v2 (пример: '71'). */
    'Total 1v2 Wins': `${number}`;
    /** (пример: '2242'). */
    'Total Entry Count': `${number}`;
    /** Общее количество раундов с расширенной статистикой (пример: '11323'). */
    'Total Rounds with extended stats': `${number}`;
    /** Общее количество ситуаций в 1v1 (пример: '328'). */
    'Total 1v1 Count': `${number}`;
    /** Общее количество побед в ситуациях 1v1 (пример: '118'). */
    'Total 1v1 Wins': `${number}`;
    /** Общее количество ситуаций в 1v2 (пример: '391'). */
    'Total 1v2 Count': `${number}`;
    /** (пример: '0.56'). */
    'Entry Success Rate': `${number}`;
    /** Общее количество убийств (пример: '11531'). */
    'Kills': `${number}`;
    /** Общее количество ослепленных врагов (пример: '2213'). */
    'Total Enemies Flashed': `${number}`;
    /** Общее количество тройных убийств (пример: '616'). */
    'Triple Kills': `${number}`;
    /** Общее количество попаданий в голову (пример: '5357'). */
    'Headshots': `${number}`;
    /** Среднее количество убийств из снайперской винтовки за раунд (пример: '0.27'). */
    'Sniper Kill Rate per Round': `${number}`;
    /** Общее количество четверных убийств за раунд (пример: '117'). */
    'Quadro Kills': `${number}`;
    /** Среднее количество убийств за матч (пример: '16.22'). */
    'Average Kills': `${number}`;
    /** Общее количество успешных использованых флешек (пример: '1474'). */
    'Total Flash Successes': `${number}`;
    /** Среднее количество нанесенного урона за раунд от гранат (пример: '2.65'). */
    'Utility Damage per Round': `${number}`;
    /** Общее количество побед (пример: '375'). */
    'Wins': `${number}`;
    /** (пример: '832.69'). */
    'K/D Ratio': '832.69';
    /** Количество сыгранных раундов (пример: '15605'). */
    'Rounds': `${number}`;
    /** Среднее количество убийств из снайперской винтовки (пример: '0.2'). */
    'Sniper Kill Rate': '0.2';
    /** Процент успешных использованых гранат (пример: '8.1'). */
    'Utility Damage Success Rate': `${number}`;
    /** Процент побед (пример: '53'). */
    'Win Rate %': `${number}`;
    /** Среднее количество попаданий в голову (пример: '47'). */
    'Average Headshots %': `${number}`;
    /** Общее количество матчей (пример: '711'). */
    'Matches': `${number}`;
    /** Среднее количество использованых гранат за раунд (пример: '0.33'). */
    'Utility Usage per Round': `${number}`;
  };
}
