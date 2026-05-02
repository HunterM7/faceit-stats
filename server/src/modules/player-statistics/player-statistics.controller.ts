import { Controller, Get, Query } from '@nestjs/common';
import { PlayerStatisticsService } from './player-statistics.service';

@Controller('api')
export class PlayerStatisticsController {
  constructor(private readonly playerStatisticsService: PlayerStatisticsService) {}

  @Get('playerStatistics')
  async getPlayerStatistics(
    @Query('nickname') nickname?: string,
    @Query('rating') rating?: string,
  ) {
    const normalizedRating =
      rating === 'country' || rating === 'region' || rating === 'both' ? rating : undefined;
    return this.playerStatisticsService.getPlayerStatisticsResponse(nickname, normalizedRating);
  }
}
