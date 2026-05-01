import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from '../../config/app-config.module';
import { StatsModule } from '../../stats/stats.module';
import { AdminBasicAuthGuard } from './admin-basic-auth.guard';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsInterceptor } from './admin-analytics.interceptor';
import { AdminAnalyticsService } from './admin-analytics.service';

@Module({
  imports: [ AppConfigModule, StatsModule ],
  controllers: [ AdminAnalyticsController ],
  providers: [
    AdminAnalyticsService,
    AdminBasicAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminAnalyticsInterceptor,
    },
  ],
  exports: [ AdminAnalyticsService ],
})
export class AdminAnalyticsModule {}
