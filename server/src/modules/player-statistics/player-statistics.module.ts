import { Module } from '@nestjs/common';
import { StatsModule } from '../../stats/stats.module';
import { PlayerStatisticsController } from './player-statistics.controller';
import { PlayerStatisticsService } from './player-statistics.service';

@Module({
  imports: [ StatsModule ],
  controllers: [ PlayerStatisticsController ],
  providers: [ PlayerStatisticsService ],
})
export class PlayerStatisticsModule {}
