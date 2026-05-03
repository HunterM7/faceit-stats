import { Injectable, Logger } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { StatsService } from '../../stats/stats.service';
import {
  type AdminEvent,
  type AdminEventSource,
  type AdminNicknameStat,
  type AdminOverviewResponse,
  type AdminPeriod,
  type AdminScope,
} from './admin-analytics.types';

type TrackRequestPayload = {
  route: string;
  source: 'stats_widget' | 'overlay_widget' | null;
  statusCode: number;
  durationMs: number;
  nicknames: string[];
  preview: boolean;
};

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);
  private readonly mongoUri: string;
  private readonly mongoDbName: string;
  private mongoClient: MongoClient | null = null;
  private collection: Collection<AdminEventDocument> | null = null;
  private isRuntimeDisabled = false;

  constructor(private readonly statsService: StatsService) {
    this.mongoUri = (process.env.MONGODB_URI || '').trim();
    this.mongoDbName = (process.env.MONGODB_DB_NAME || 'faceit_stats').trim();
    if (!this.mongoUri) {
      this.logger.warn('MongoDB не настроен. Аналитика отключена (ожидается MONGODB_URI).');
    }
  }

  async trackRequest(payload: TrackRequestPayload): Promise<void> {
    if (this.isRuntimeDisabled) {
      return;
    }

    try {
      const collection = await this.getCollection();
      if (!collection) {
        return;
      }

      const now = new Date();
      const normalizedNicknames = Array.from(new Set(payload.nicknames.map((nickname) => this.normalizeNickname(nickname)).filter(Boolean)));

      await collection.insertOne({
        createdAt: now,
        route: payload.route,
        source: payload.source,
        statusCode: payload.statusCode,
        durationMs: payload.durationMs,
        nicknames: normalizedNicknames,
        preview: payload.preview,
      });
    } catch (error) {
      this.isRuntimeDisabled = true;
      this.logger.error(`Mongo аналитика отключена после ошибки записи: ${(error as Error).message}`);
    }
  }

  async getOverview(period: AdminPeriod, scope: AdminScope): Promise<AdminOverviewResponse> {
    if (this.isRuntimeDisabled) {
      return {
        period,
        scope,
        totalEvents: 0,
        productionEvents: 0,
        previewEvents: 0,
        uniqueUsers: 0,
        topNicknames: [],
        chart: [],
        latestEvents: [],
        storage: 'disabled',
      };
    }

    try {
      const collection = await this.getCollection();
      if (!collection) {
        return {
          period,
          scope,
          totalEvents: 0,
          productionEvents: 0,
          previewEvents: 0,
          uniqueUsers: 0,
          topNicknames: [],
          chart: [],
          latestEvents: [],
          storage: 'disabled',
        };
      }

      const now = new Date();
      const periodStartDate = this.getPeriodStartDate(period, now);
      const [ requestVolume, uniqueUsers, topNicknames, chart, latestEvents ] = await Promise.all([
        this.getRequestVolume(collection, periodStartDate, scope),
        this.getUniqueUsers(collection, periodStartDate, scope),
        this.getTopNicknames(collection, periodStartDate, scope),
        this.getChart(collection, period, now, scope),
        this.getLatestEvents(collection, periodStartDate, scope),
      ]);

      return {
        period,
        scope,
        totalEvents: requestVolume.totalEvents,
        productionEvents: requestVolume.productionEvents,
        previewEvents: requestVolume.previewEvents,
        uniqueUsers,
        topNicknames,
        chart,
        latestEvents,
        storage: 'mongo',
      };
    } catch (error) {
      this.isRuntimeDisabled = true;
      this.logger.error(`Mongo аналитика отключена после ошибки чтения: ${(error as Error).message}`);
      return {
        period,
        scope,
        totalEvents: 0,
        productionEvents: 0,
        previewEvents: 0,
        uniqueUsers: 0,
        topNicknames: [],
        chart: [],
        latestEvents: [],
        storage: 'disabled',
      };
    }
  }

  private async getRequestVolume(
    collection: Collection<AdminEventDocument>,
    periodStartDate: Date | null,
    scope: AdminScope,
  ): Promise<{ totalEvents: number; productionEvents: number; previewEvents: number }> {
    const base = this.getScopeBaseQuery(periodStartDate, scope);
    const productionClause = { preview: { $ne: true } as const };
    const previewClause = { preview: true as const };
    const [ totalEvents, productionEvents, previewEvents ] = await Promise.all([
      collection.countDocuments(base),
      collection.countDocuments({ ...base, ...productionClause }),
      collection.countDocuments({ ...base, ...previewClause }),
    ]);
    return { totalEvents, productionEvents, previewEvents };
  }

  private async getUniqueUsers(
    collection: Collection<AdminEventDocument>,
    periodStartDate: Date | null,
    scope: AdminScope,
  ): Promise<number> {
    const query = this.getProductionOverviewQuery(periodStartDate, scope);
    const result = await collection.aggregate<{ count: number }>([
      { $match: query },
      { $unwind: '$nicknames' },
      { $group: { _id: '$nicknames' } },
      { $count: 'count' },
    ]).toArray();
    return result[0]?.count ?? 0;
  }

  private async getTopNicknames(
    collection: Collection<AdminEventDocument>,
    periodStartDate: Date | null,
    scope: AdminScope,
  ): Promise<AdminNicknameStat[]> {
    const query = this.getProductionOverviewQuery(periodStartDate, scope);
    const rawTop = await collection.aggregate<{ nickname: string; count: number }>([
      { $match: query },
      { $unwind: '$nicknames' },
      { $group: { _id: '$nicknames', count: { $sum: 1 } } },
      { $project: { _id: 0, nickname: '$_id', count: 1 } },
      { $sort: { count: -1 as const } },
      { $limit: 12 },
    ]).toArray();
    return await Promise.all(rawTop.map(async (item) => ({
      nickname: item.nickname,
      count: item.count,
      elo: await this.resolveNicknameElo(item.nickname),
    })));
  }

  private async getChart(
    collection: Collection<AdminEventDocument>,
    period: AdminPeriod,
    now: Date,
    scope: AdminScope,
  ): Promise<Array<{ label: string; count: number; dateKey: string }>> {
    if (period === 'day') {
      const hourKeys = this.getLastHoursKeys(24, now);
      const startDate = new Date(hourKeys[0]);
      const chartQuery = this.getProductionOverviewQuery(startDate, scope);
      const aggregated = await collection.aggregate<{ _id: string; count: number }>([
        { $match: chartQuery },
        {
          $group: {
            _id: {
              $dateToString: {
                date: '$createdAt',
                format: '%Y-%m-%dT%H:00:00.000Z',
                timezone: 'UTC',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 as const } },
      ]).toArray();

      const map = new Map(aggregated.map((item) => [ item._id, item.count ]));
      return hourKeys.map((key) => ({
        label: this.toHourChartLabel(key),
        dateKey: key.slice(0, 10),
        count: map.get(key) ?? 0,
      }));
    }

    let points = 30;
    if (period === 'week') {
      points = 7;
    }
    const dayKeys = this.getLastDaysKeys(points, now);
    const startDate = new Date(`${dayKeys[0]}T00:00:00.000Z`);

    const chartQuery = this.getProductionOverviewQuery(startDate, scope);
    const aggregated = await collection.aggregate<{ _id: string; count: number }>([
      { $match: chartQuery },
      {
        $group: {
          _id: {
            $dateToString: {
              date: '$createdAt',
              format: '%Y-%m-%d',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as const } },
    ]).toArray();

    const map = new Map(aggregated.map((item) => [ item._id, item.count ]));
    return dayKeys.map((key) => ({
      label: this.toChartLabel(key),
      dateKey: key,
      count: map.get(key) ?? 0,
    }));
  }

  private async getLatestEvents(
    collection: Collection<AdminEventDocument>,
    periodStartDate: Date | null,
    scope: AdminScope,
  ): Promise<AdminEvent[]> {
    const query = this.getProductionOverviewQuery(periodStartDate, scope);
    const rows = await collection.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    return rows.map((row) => ({
      timestamp: row.createdAt.toISOString(),
      route: row.route,
      source: this.toAdminEventSource(row.source),
      statusCode: row.statusCode,
      durationMs: row.durationMs,
      nicknames: row.nicknames,
      preview: row.preview === true,
    }));
  }

  private getLastDaysKeys(days: number, now: Date): string[] {
    const keys: string[] = [];
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      date.setUTCDate(date.getUTCDate() - index);
      keys.push(this.getDateKey(date));
    }
    return keys;
  }

  private getLastHoursKeys(hours: number, now: Date): string[] {
    const keys: string[] = [];
    for (let index = hours - 1; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setUTCMinutes(0, 0, 0);
      date.setUTCHours(date.getUTCHours() - index);
      keys.push(this.getHourKey(date));
    }
    return keys;
  }

  private getDateKey(date: Date): string {
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getHourKey(date: Date): string {
    return date.toISOString().slice(0, 13) + ':00:00.000Z';
  }

  private toChartLabel(dateKey: string): string {
    const [ , month, day ] = dateKey.split('-');
    return `${day}.${month}`;
  }

  private toHourChartLabel(hourKey: string): string {
    return hourKey.slice(11, 13);
  }

  private getPeriodStartDate(period: AdminPeriod, now: Date): Date | null {
    if (period === 'all') {
      return null;
    }
    const date = new Date(now);
    if (period === 'day') {
      date.setDate(date.getDate() - 1);
      return date;
    }
    if (period === 'week') {
      date.setDate(date.getDate() - 7);
      return date;
    }
    date.setMonth(date.getMonth() - 1);
    return date;
  }

  private toAdminEventSource(raw: unknown): AdminEventSource {
    if (raw === 'stats_widget' || raw === 'overlay_widget') {
      return raw;
    }
    return null;
  }

  private normalizeNickname(value: string): string {
    return value.trim();
  }

  private async resolveNicknameElo(nickname: string): Promise<number | null> {
    try {
      const snapshot = await this.statsService.getPlayerSnapshotByNickname(nickname);
      return snapshot.currentElo ?? null;
    } catch {
      return null;
    }
  }

  /** Период и источник, без фильтра по preview (для подсчёта всех запросов и доли превью). */
  private getScopeBaseQuery(periodStartDate: Date | null, scope: AdminScope): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (periodStartDate) {
      query.createdAt = {
        $gte: periodStartDate,
      };
    }
    if (scope !== 'overall') {
      query.source = scope;
    }
    return query;
  }

  /** Только «боевые» события: без превью (график, топ ников, уникальные пользователи). */
  private getProductionOverviewQuery(periodStartDate: Date | null, scope: AdminScope): Record<string, unknown> {
    return {
      ...this.getScopeBaseQuery(periodStartDate, scope),
      preview: { $ne: true },
    };
  }

  private async getCollection(): Promise<Collection<AdminEventDocument> | null> {
    if (!this.mongoUri || this.isRuntimeDisabled) {
      return null;
    }

    if (this.collection) {
      return this.collection;
    }

    try {
      this.mongoClient = new MongoClient(this.mongoUri);
      await this.mongoClient.connect();
      const db = this.mongoClient.db(this.mongoDbName);
      this.collection = db.collection<AdminEventDocument>('admin_events');
      await this.collection.createIndex({ createdAt: -1 });
      await this.collection.createIndex({ nicknames: 1, createdAt: -1 });
      await this.collection.createIndex({ source: 1, createdAt: -1 });
      await this.collection.createIndex({ preview: 1, createdAt: -1 });
      return this.collection;
    } catch (error) {
      this.isRuntimeDisabled = true;
      this.logger.error(`Mongo аналитика отключена после ошибки подключения: ${(error as Error).message}`);
      return null;
    }
  }
}

type AdminEventDocument = {
  createdAt: Date;
  route: string;
  source?: 'stats_widget' | 'overlay_widget' | string | null;
  statusCode: number;
  durationMs: number;
  nicknames: string[];
  preview?: boolean;
};
