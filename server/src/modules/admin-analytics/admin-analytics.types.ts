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

export type AdminEvent = {
  timestamp: string;
  route: string;
  source: AdminScope | null;
  statusCode: number;
  durationMs: number;
  nicknames: string[];
};

export type AdminOverviewResponse = {
  period: AdminPeriod;
  scope: AdminScope;
  totalEvents: number;
  uniqueUsers: number;
  topNicknames: AdminNicknameStat[];
  chart: AdminChartItem[];
  latestEvents: AdminEvent[];
  storage: 'mongo' | 'disabled';
};
