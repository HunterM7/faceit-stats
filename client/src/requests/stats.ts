import { buildApiUrl } from '@config/api'

export type WidgetSource = 'stats_widget' | 'overlay_widget'

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
    rankLabel: string;
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

export async function requestStats(nickname?: string, source?: WidgetSource): Promise<StatsPayload> {
  const endpoint = buildApiUrl('/api/playerStatistics')
  const params = new URLSearchParams()
  if (nickname?.trim()) {
    params.set('nickname', nickname.trim())
  }
  if (source) {
    params.set('source', source)
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${endpoint}${query}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return (await response.json()) as StatsPayload
}
