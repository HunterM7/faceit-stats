import { buildApiUrl } from '@config/api'

export type AdminPeriod = 'day' | 'week' | 'month' | 'all'

export class AdminUnauthorizedError extends Error {
  constructor(message = 'Требуется авторизация для доступа к админке.') {
    super(message)
    this.name = 'AdminUnauthorizedError'
  }
}

export type AdminOverviewPayload = {
  period: AdminPeriod;
  totalEvents: number;
  uniqueUsers: number;
  topNicknames: Array<{ nickname: string; count: number }>;
  chart: Array<{ label: string; count: number }>;
  latestEvents: Array<{
    timestamp: string;
    route: string;
    statusCode: number;
    durationMs: number;
    nicknames: string[];
  }>;
  storage: 'mongo' | 'disabled';
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

export async function requestAdminOverview(period: AdminPeriod, authToken?: string): Promise<AdminOverviewPayload> {
  const endpoint = buildApiUrl('/api/admin/overview')
  const response = await fetch(`${endpoint}?period=${encodeURIComponent(period)}`, {
    cache: 'no-store',
    headers: authToken ? { Authorization: `Basic ${authToken}` } : undefined,
  })
  if (response.status === 401) {
    throw new AdminUnauthorizedError()
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }
  return (await response.json()) as AdminOverviewPayload
}
