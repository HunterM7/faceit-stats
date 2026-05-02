import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';
import type { StatsRatingQuery } from '../../stats/stats.types';

@Injectable()
export class PlayerStatisticsService {
  constructor(private readonly statsService: StatsService) {}

  async getPlayerStatisticsResponse(nickname?: string, rating?: StatsRatingQuery) {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      throw new BadRequestException('Укажи параметр ?nickname=...');
    }

    try {
      return await this.statsService.getStatsByNickname(normalizedNickname, { rating });
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || '';
      if (/404|not found|player/i.test(errorMessage)) {
        throw new NotFoundException('Игрок не найден. Проверьте никнейм FACEIT.');
      }
      throw new BadGatewayException('Не удалось получить статистику игрока');
    }
  }
}
