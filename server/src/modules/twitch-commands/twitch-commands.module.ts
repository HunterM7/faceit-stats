import { Module } from '@nestjs/common';
import { StatsModule } from '../../stats/stats.module';
import { TwitchCommandsController } from './twitch-commands.controller';
import { TwitchCommandsService } from './twitch-commands.service';

@Module({
  imports: [ StatsModule ],
  controllers: [ TwitchCommandsController ],
  providers: [ TwitchCommandsService ],
})
export class TwitchCommandsModule {}
