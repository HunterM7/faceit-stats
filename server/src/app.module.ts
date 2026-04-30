import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/app-config.module';
import { configuration } from './config/configuration';
import { FaceitModule } from './faceit/faceit.module';
import { AdminAnalyticsModule } from './modules/admin-analytics/admin-analytics.module';
import { DuoMatchesModule } from './modules/duo-matches/duo-matches.module';
import { LastMatchModule } from './modules/last-match/last-match.module';
import { PlayerModule } from './modules/player/player.module';
import { PlayerStatisticsModule } from './modules/player-statistics/player-statistics.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [ '.env', '../.env' ],
      load: [ configuration ],
    }),
    AppConfigModule,
    FaceitModule,
    AdminAnalyticsModule,
    StatsModule,
    PlayerStatisticsModule,
    LastMatchModule,
    PlayerModule,
    DuoMatchesModule,
  ],
})
export class AppModule {}
