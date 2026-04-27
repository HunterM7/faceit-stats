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

export type DuoMatchItem = {
  matchId: string
  finishedAt: string | null
  status: string | null
  result: 'WIN' | 'LOSS' | 'UNKNOWN'
  teamScore: number | null
  enemyScore: number | null
  faceitUrl: string | null
}

export type DuoMatchesPayload = {
  nickname: string
  teammateNickname: string
  gameId: string
  totalChecked: number
  totalTogether: number
  matches: DuoMatchItem[]
}

export async function requestDuoMatches(nickname: string, teammateNickname: string): Promise<DuoMatchesPayload> {
  const endpoint = buildApiUrl('/api/duoMatches')
  const params = new URLSearchParams({
    nickname: nickname.trim(),
    teammateNickname: teammateNickname.trim(),
  })
  const response = await fetch(`${endpoint}?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return (await response.json()) as DuoMatchesPayload
}
