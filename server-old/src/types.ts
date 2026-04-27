export type MatchResult = "WIN" | "LOSS" | "UNKNOWN";

export interface PlayerGameData {
  faceit_elo?: number;
  skill_level?: number;
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

export interface StatsResponse {
  nickname: string;
  country: string | null;
  playerId: string;
  gameId: string;
  faceitElo: number | null;
  skillLevel: number | null;
  winRate: number | null;
  averageKills: number | null;
  averageAdr: number | null;
  kdRatio: number | null;
  krRatio: number | null;
  last30Wins: number;
  last30Losses: number;
  todayWins: number;
  todayLosses: number;
  latestMatchId: string | null;
  latestMatchStatus: string | null;
  latestMatchResult: MatchResult;
  updatedAt: string;
  raw: {
    player: PlayerResponse;
    gameStats: Record<string, unknown>;
    history: MatchHistoryResponse;
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
