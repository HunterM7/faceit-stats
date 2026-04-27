import { Module } from '@nestjs/common';
import { FaceitModule } from '../faceit/faceit.module';
import { StatsService } from './stats.service';

@Module({
  imports: [ FaceitModule ],
  providers: [ StatsService ],
  exports: [ StatsService ],
})
export class StatsModule {}
