import { Module } from '@nestjs/common';
import { StatsModule } from '../../stats/stats.module';
import { DuoMatchesController } from './duo-matches.controller';
import { DuoMatchesService } from './duo-matches.service';

@Module({
  imports: [ StatsModule ],
  controllers: [ DuoMatchesController ],
  providers: [ DuoMatchesService ],
})
export class DuoMatchesModule {}
