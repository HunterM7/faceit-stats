import { buildApiUrl } from '@config/api';
import { type WidgetSource } from './stats';

export type LastMatchPayload = {
  matchId?: string | null;
  status?: string | null;
  result?: 'WIN' | 'LOSS' | 'UNKNOWN';
  currentElo?: number | null;
  currentSkillLevel?: number | null;
  finishedAt?: string | null;
  updatedAt?: string;
  raw?: {
    player?: unknown;
    history?: unknown;
    latestMatch?: unknown;
  };
};

export type ApiErrorPayload = {
  ok?: boolean;
  message?: string;
  error?: string;
};

function toApiErrorMessage(raw: unknown, fallback: string): string {
  if (raw && typeof raw === 'object' && 'message' in raw && typeof (raw as { message?: unknown }).message === 'string') {
    return (raw as { message: string }).message;
  }
  return fallback;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = `Ошибка запроса: статус ${response.status}`;
  try {
    const body = (await response.json()) as unknown;
    return toApiErrorMessage(body, fallback);
  } catch {
    return fallback;
  }
}

export type PlayerPayload = {
  playerId?: string | null;
  nickname?: string;
  gameId?: string;
  currentElo?: number | null;
  currentSkillLevel?: number | null;
  updatedAt?: string;
};

export async function lastMatch(playerId: string, source?: WidgetSource): Promise<LastMatchPayload> {
  const endpoint = buildApiUrl('/api/lastMatch');
  const params = new URLSearchParams({
    playerId: playerId.trim(),
  });
  if (source) {
    params.set('source', source);
  }
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as LastMatchPayload;
}

export async function player(nickname: string, source?: WidgetSource): Promise<PlayerPayload> {
  const endpoint = buildApiUrl('/api/player');
  const params = new URLSearchParams({
    nickname: nickname.trim(),
  });
  if (source) {
    params.set('source', source);
  }
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as PlayerPayload;
}
