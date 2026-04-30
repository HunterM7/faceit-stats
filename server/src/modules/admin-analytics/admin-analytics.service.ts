import { Injectable, Logger } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import {
  type AdminEvent,
  type AdminNicknameStat,
  type AdminOverviewResponse,
  type AdminPeriod,
} from './admin-analytics.types';

type TrackRequestPayload = {
  route: string;
  statusCode: number;
  durationMs: number;
  nicknames: string[];
};

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);
  private readonly mongoUri: string;
  private readonly mongoDbName: string;
  private mongoClient: MongoClient | null = null;
  private collection: Collection<AdminEventDocument> | null = null;
  private isRuntimeDisabled = false;

  constructor() {
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
        statusCode: payload.statusCode,
        durationMs: payload.durationMs,
        nicknames: normalizedNicknames,
      });
    } catch (error) {
      this.isRuntimeDisabled = true;
      this.logger.error(`Mongo аналитика отключена после ошибки записи: ${(error as Error).message}`);
    }
  }

  async getOverview(period: AdminPeriod): Promise<AdminOverviewResponse> {
    if (this.isRuntimeDisabled) {
      return {
        period,
        totalEvents: 0,
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
          totalEvents: 0,
          uniqueUsers: 0,
          topNicknames: [],
          chart: [],
          latestEvents: [],
          storage: 'disabled',
        };
      }

      const now = new Date();
      const periodStartDate = this.getPeriodStartDate(period, now);
      const [ totalEvents, uniqueUsers, topNicknames, chart, latestEvents ] = await Promise.all([
        this.getTotalEvents(collection, periodStartDate),
        this.getUniqueUsers(collection, periodStartDate),
        this.getTopNicknames(collection, periodStartDate),
        this.getChart(collection, period, now),
        this.getLatestEvents(collection, periodStartDate),
      ]);

      return {
        period,
        totalEvents,
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
        totalEvents: 0,
        uniqueUsers: 0,
        topNicknames: [],
        chart: [],
        latestEvents: [],
        storage: 'disabled',
      };
    }
  }

  private async getTotalEvents(collection: Collection<AdminEventDocument>, periodStartDate: Date | null): Promise<number> {
    const query = this.getPeriodQuery(periodStartDate);
    return await collection.countDocuments(query);
  }

  private async getUniqueUsers(collection: Collection<AdminEventDocument>, periodStartDate: Date | null): Promise<number> {
    const query = this.getPeriodQuery(periodStartDate);
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
  ): Promise<AdminNicknameStat[]> {
    const query = this.getPeriodQuery(periodStartDate);
    return await collection.aggregate<AdminNicknameStat>([
      { $match: query },
      { $unwind: '$nicknames' },
      { $group: { _id: '$nicknames', count: { $sum: 1 } } },
      { $project: { _id: 0, nickname: '$_id', count: 1 } },
      { $sort: { count: -1 as const } },
      { $limit: 12 },
    ]).toArray();
  }

  private async getChart(
    collection: Collection<AdminEventDocument>,
    period: AdminPeriod,
    now: Date,
  ): Promise<Array<{ label: string; count: number }>> {
    let points = 30;
    if (period === 'day') {
      points = 1;
    } else if (period === 'week') {
      points = 7;
    }
    const dayKeys = this.getLastDaysKeys(points, now);
    const startDate = new Date(`${dayKeys[0]}T00:00:00.000Z`);

    const aggregated = await collection.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: startDate } } },
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
      count: map.get(key) ?? 0,
    }));
  }

  private async getLatestEvents(collection: Collection<AdminEventDocument>, periodStartDate: Date | null): Promise<AdminEvent[]> {
    const query = this.getPeriodQuery(periodStartDate);
    const rows = await collection.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    return rows.map((row) => ({
      timestamp: row.createdAt.toISOString(),
      route: row.route,
      statusCode: row.statusCode,
      durationMs: row.durationMs,
      nicknames: row.nicknames,
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

  private getDateKey(date: Date): string {
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toChartLabel(dateKey: string): string {
    const [ , month, day ] = dateKey.split('-');
    return `${day}.${month}`;
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

  private normalizeNickname(value: string): string {
    return value.trim().toLowerCase();
  }

  private getPeriodQuery(periodStartDate: Date | null): Record<string, unknown> {
    if (!periodStartDate) {
      return {};
    }
    return {
      createdAt: {
        $gte: periodStartDate,
      },
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
  statusCode: number;
  durationMs: number;
  nicknames: string[];
};
