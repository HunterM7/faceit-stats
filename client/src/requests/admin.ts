import { buildApiUrl } from '@config/api'

export type AdminPeriod = 'day' | 'week' | 'month' | 'all'
export type AdminScope = 'overall' | 'stats_widget' | 'overlay_widget'

export type AdminEventSource = 'stats_widget' | 'overlay_widget' | null

export class AdminUnauthorizedError extends Error {
  constructor(message = 'Требуется авторизация для доступа к админке.') {
    super(message)
    this.name = 'AdminUnauthorizedError'
  }
}

export type AdminOverviewPayload = {
  period: AdminPeriod;
  scope: AdminScope;
  totalEvents: number;
  productionEvents: number;
  previewEvents: number;
  uniqueUsers: number;
  topNicknames: Array<{ nickname: string; count: number; elo: number | null }>;
  chart: Array<{ label: string; count: number; dateKey: string }>;
  latestEvents: Array<{
    timestamp: string;
    route: string;
    source: AdminEventSource;
    statusCode: number;
    durationMs: number;
    nicknames: string[];
    preview: boolean;
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

export async function requestAdminOverview(period: AdminPeriod, scope: AdminScope, authToken?: string): Promise<AdminOverviewPayload> {
  const endpoint = buildApiUrl('/api/admin/overview')
  const params = new URLSearchParams({
    period,
    scope,
  })
  const response = await fetch(`${endpoint}?${params.toString()}`, {
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
