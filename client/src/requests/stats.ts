import { buildApiUrl } from '@config/api'

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
  nickname: string
  country: string | null
  faceitElo: number
  skillLevel: number
  gameId?: string
  updatedAt?: string | null
  latestMatchId?: string | null
  latestMatchStatus?: string | null
  latestMatchResult: 'WIN' | 'LOSS' | 'UNKNOWN'
  winRate: number
  averageKills: number
  averageAdr: number
  kdRatio: number
  krRatio: number
  last30Wins: number
  last30Losses: number
  todayWins: number
  todayLosses: number
  raw?: {
    player?: unknown
    gameStats?: unknown
    history?: unknown
  }
}

export async function requestStats(nickname?: string): Promise<StatsPayload> {
  const endpoint = buildApiUrl('/api/playerStatistics')
  const query = nickname?.trim() ? `?nickname=${encodeURIComponent(nickname.trim())}` : ''
  const response = await fetch(`${endpoint}${query}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return (await response.json()) as StatsPayload
}
