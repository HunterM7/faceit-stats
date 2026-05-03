import { buildApiUrl } from '@config/api'

export type WidgetSource = 'stats_widget' | 'overlay_widget'

/**
 * `?rating=` для `/api/playerStatistics`.
 * Без параметра — на сервере по умолчанию только страна; `both` — страна и регион.
 */
export type StatsRatingQuery = 'country' | 'region' | 'both'

export type StatsRankSlice = {
  /** Код региона или страны (например `EU`, `NA`, `OCE`, `RU`, `US` и тд.). */
  code: string;
  /** Рейтинг игрока в данном регионе или стране. */
  rating: number;
}

/** Рейтинг игрока в регионе и стране. */
export type StatsRankBlock = {
  /** Рейтинг игрока в регионе. */
  region?: StatsRankSlice;
  /** Рейтинг игрока в стране. */
  country?: StatsRankSlice;
}

function extractErrorMessage(raw: unknown, fallback: string): string {
  if (raw && typeof raw === 'object' && 'message' in raw && typeof (raw as { message?: unknown }).message === 'string') {
    return (raw as { message: string }).message
  }
  return fallback
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = `Ошибка запроса: статус ${response.status}`
  try {
    const body = (await response.json()) as unknown
    return extractErrorMessage(body, fallback)
  } catch {
    return fallback
  }
}

export type StatsPayload = {
  nickname: string;
  country: string | null;
  playerId?: string | null;
  common: {
    faceitElo: number;
    skillLevel: number;
    kdRatio: number;
    /** Рейтинг игрока в регионе и стране. */
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
  gameId?: string;
  updatedAt?: string | null;
  latestMatchId?: string | null;
  latestMatchStatus?: string | null;
  latestMatchResult: 'WIN' | 'LOSS' | 'UNKNOWN';
  raw?: {
    player?: unknown;
    gameStats?: unknown;
    history?: unknown;
    internalStats?: unknown;
  };
}

export type RequestStatsOptions = {
  /** Запрос с страницы превью виджета — не учитывается в основной аналитике. */
  preview?: boolean;
};

export async function requestStats(
  nickname?: string,
  source?: WidgetSource,
  rating?: StatsRatingQuery,
  options?: RequestStatsOptions,
): Promise<StatsPayload> {
  const endpoint = buildApiUrl('/api/playerStatistics')
  const params = new URLSearchParams()
  if (nickname?.trim()) {
    params.set('nickname', nickname.trim())
  }
  if (source) {
    params.set('source', source)
  }
  if (rating) {
    params.set('rating', rating)
  }
  if (options?.preview) {
    params.set('preview', '1')
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${endpoint}${query}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return (await response.json()) as StatsPayload
}
