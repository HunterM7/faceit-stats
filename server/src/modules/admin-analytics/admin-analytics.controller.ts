import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminBasicAuthGuard } from './admin-basic-auth.guard';
import { type AdminPeriod } from './admin-analytics.types';

@Controller('api/admin')
@UseGuards(AdminBasicAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('overview')
  async getOverview(@Query('period') periodRaw?: string) {
    const period = this.parsePeriod(periodRaw);
    return this.analyticsService.getOverview(period);
  }

  private parsePeriod(raw?: string): AdminPeriod {
    const period = raw?.trim() || 'day';
    if (period === 'day' || period === 'week' || period === 'month' || period === 'all') {
      return period;
    }
    throw new BadRequestException('Некорректный period. Используйте day|week|month|all.');
  }
}
