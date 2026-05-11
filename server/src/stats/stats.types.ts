export type MatchResult = 'WIN' | 'LOSS';

/** Реэкспорт DTO FACEIT (раньше жили в этом файле). */
export type {
  InternalMatchStatsItem,
  InternalMatchStatsResponse,
  MatchHistoryItem,
  MatchHistoryResponse,
  MatchPlayer,
  MatchTeam,
  PlayerGameData,
  PlayerGameStatsResponse,
  PlayerGlobalRankingItem,
  PlayerGlobalRankingResponse,
  PlayerResponse,
} from '../faceit/faceit.types';

/**
 * `?rating=` для `/api/playerStatistics`.
 * Без параметра или `country` — только лидерборд по стране; `region` — по региону; `both` — оба.
 */
export type StatsRatingQuery = 'country' | 'region' | 'both';

export interface StatsRankSlice {
  code: string;
  rating: number;
}

export interface StatsRankBlock {
  region?: StatsRankSlice;
  country?: StatsRankSlice;
}

export interface StatsResponse {
  nickname: string;
  playerId: string;
  common: {
    elo: number;
    skillLevel: number;
    kd: number;
    /** Лидерборд FACEIT: по умолчанию (`?rating` нет или `country`) только страна; `both` — страна и регион. */
    rank: StatsRankBlock;
  };
  daily: {
    wins: number;
    losses: number;
    avg: number;
    adr: number;
    kd: number;
  };
  last30: {
    wins: number;
    losses: number;
    winRatePercent: number;
    avg: number;
    adr: number;
    kd: number;
    kr: number;
    /** Победы за последние матчи по времени: `true` — победа, `false` — поражение (слева старые). */
    matchResults: boolean[];
  };
  latestMatchId: string | null;
  latestMatchStatus: string | null;
  latestMatchResult: MatchResult;
  updatedAt: string;
}

/**
 * Ответ `/api/lastMatch`: один запрос к истории матчей игрока.
 * Elo/уровень не подгружаются — клиент при смене `matchId` дергает `/api/player` или полные статы.
 */
export interface LastMatchResponse {
  /** Идентификатор последнего матча игрока. */
  matchId: string;
  /** Результат последнего матча игрока. */
  result: MatchResult;
  /** Время окончания последнего матча игрока. */
  finishedAt: string | null;
}

export interface PlayerSnapshotResponse {
  playerId: string | null;
  nickname: string;
  gameId: string;
  currentElo: number | null;
  currentSkillLevel: number | null;
  updatedAt: string;
}
