export type AdminPeriod = 'day' | 'week' | 'month' | 'all';
export type AdminScope = 'overall' | 'stats_widget' | 'overlay_widget';

export type AdminNicknameStat = {
  nickname: string;
  count: number;
  elo: number | null;
};

export type AdminChartItem = {
  label: string;
  count: number;
  dateKey: string;
};

export type AdminEventSource = 'stats_widget' | 'overlay_widget' | null;

export type AdminEvent = {
  timestamp: string;
  route: string;
  source: AdminEventSource;
  statusCode: number;
  durationMs: number;
  nicknames: string[];
  preview: boolean;
};

export type AdminOverviewResponse = {
  period: AdminPeriod;
  scope: AdminScope;
  /** Все запросы за период (реальные + превью). */
  totalEvents: number;
  /** Запросы без флага превью. */
  productionEvents: number;
  /** Запросы с preview=1 (демо на страницах виджетов). */
  previewEvents: number;
  uniqueUsers: number;
  topNicknames: AdminNicknameStat[];
  chart: AdminChartItem[];
  latestEvents: AdminEvent[];
  storage: 'mongo' | 'disabled';
};
