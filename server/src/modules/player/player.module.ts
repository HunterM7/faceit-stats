import { Module } from '@nestjs/common';
import { StatsModule } from '../../stats/stats.module';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [ StatsModule ],
  controllers: [ PlayerController ],
  providers: [ PlayerService ],
})
export class PlayerModule {}
