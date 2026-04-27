import { Controller, Get, Query } from '@nestjs/common';
import { PlayerStatisticsService } from './player-statistics.service';

@Controller('api')
export class PlayerStatisticsController {
  constructor(private readonly playerStatisticsService: PlayerStatisticsService) {}

  @Get('playerStatistics')
  async getPlayerStatistics(@Query('nickname') nickname?: string) {
    return this.playerStatisticsService.getPlayerStatisticsResponse(nickname);
  }
}
