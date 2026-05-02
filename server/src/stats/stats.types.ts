export type MatchResult = 'WIN' | 'LOSS' | 'UNKNOWN';

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
  country: string | null;
  playerId: string;
  gameId: string;
  common: {
    faceitElo: number;
    skillLevel: number;
    kdRatio: number;
    /** Лидерборд FACEIT: по умолчанию (`?rating` нет или `country`) только страна; `both` — страна и регион. */
    rank: StatsRankBlock;
  };
  daily: {
    wins: number;
    losses: number;
    averageKills: number;
    averageAdr: number;
    kdRatio: number;
  };
  last30: {
    wins: number;
    losses: number;
    winRate: number;
    averageKills: number;
    averageAdr: number;
    kdRatio: number;
    krRatio: number;
  };
  latestMatchId: string | null;
  latestMatchStatus: string | null;
  latestMatchResult: MatchResult;
  updatedAt: string;
  raw: {
    player: PlayerResponse;
    gameStats: Record<string, unknown>;
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

export interface DuoMatchItem {
  matchId: string;
  finishedAt: string | null;
  status: string | null;
  result: MatchResult;
  teamScore: number | null;
  enemyScore: number | null;
  faceitUrl: string | null;
}

export interface DuoMatchesResponse {
  nickname: string;
  teammateNickname: string;
  gameId: string;
  totalChecked: number;
  totalTogether: number;
  matches: DuoMatchItem[];
}
