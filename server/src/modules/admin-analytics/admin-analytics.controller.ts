import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminBasicAuthGuard } from './admin-basic-auth.guard';
import { type AdminPeriod, type AdminScope } from './admin-analytics.types';

@Controller('api/admin')
@UseGuards(AdminBasicAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('overview')
  async getOverview(@Query('period') periodRaw?: string, @Query('scope') scopeRaw?: string) {
    const period = this.parsePeriod(periodRaw);
    const scope = this.parseScope(scopeRaw);
    return this.analyticsService.getOverview(period, scope);
  }

  private parsePeriod(raw?: string): AdminPeriod {
    const period = raw?.trim() || 'day';
    if (period === 'day' || period === 'week' || period === 'month' || period === 'all') {
      return period;
    }
    throw new BadRequestException('Некорректный period. Используйте day|week|month|all.');
  }

  private parseScope(raw?: string): AdminScope {
    const scope = raw?.trim() || 'overall';
    if (scope === 'overall' || scope === 'stats_widget' || scope === 'overlay_widget') {
      return scope;
    }
    throw new BadRequestException('Некорректный scope. Используйте overall|stats_widget|overlay_widget.');
  }
}
