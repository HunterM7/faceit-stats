import type {
  InternalMatchStatsResponse,
  MatchHistoryItem,
  MatchHistoryResponse,
  PlayerGameStatsResponse,
  PlayerResponse,
} from '../faceit/faceit.types';

export type MatchResult = 'WIN' | 'LOSS' | 'UNKNOWN';

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
  raw: {
    player: PlayerResponse;
    gameStats: PlayerGameStatsResponse;
    history: MatchHistoryResponse;
    internalStats: InternalMatchStatsResponse;
  };
}

export interface LastMatchResponse {
  matchId: string | null;
  status: string | null;
  result: MatchResult;
  currentElo: number | null;
  currentSkillLevel: number | null;
  finishedAt: string | null;
  updatedAt: string;
  raw: {
    player: PlayerResponse | Record<string, never>;
    history: MatchHistoryResponse | Record<string, never>;
    latestMatch: MatchHistoryItem | null;
  };
}

export interface PlayerSnapshotResponse {
  playerId: string | null;
  nickname: string;
  gameId: string;
  currentElo: number | null;
  currentSkillLevel: number | null;
  updatedAt: string;
}
