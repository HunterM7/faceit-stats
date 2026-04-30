export type AdminPeriod = 'day' | 'week' | 'month' | 'all';

export type AdminNicknameStat = {
  nickname: string;
  count: number;
};

export type AdminChartItem = {
  label: string;
  count: number;
};

export type AdminEvent = {
  timestamp: string;
  route: string;
  statusCode: number;
  durationMs: number;
  nicknames: string[];
};

export type AdminOverviewResponse = {
  period: AdminPeriod;
  totalEvents: number;
  uniqueUsers: number;
  topNicknames: AdminNicknameStat[];
  chart: AdminChartItem[];
  latestEvents: AdminEvent[];
  storage: 'mongo' | 'disabled';
};
