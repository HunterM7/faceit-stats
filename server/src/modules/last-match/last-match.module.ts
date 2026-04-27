import { Module } from '@nestjs/common';
import { StatsModule } from '../../stats/stats.module';
import { LastMatchController } from './last-match.controller';
import { LastMatchService } from './last-match.service';

@Module({
  imports: [ StatsModule ],
  controllers: [ LastMatchController ],
  providers: [ LastMatchService ],
})
export class LastMatchModule {}
