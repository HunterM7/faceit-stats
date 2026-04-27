import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';

@Injectable()
export class LastMatchService {
  constructor(private readonly statsService: StatsService) {}

  async getLastMatchResponse(playerId?: string) {
    const normalizedPlayerId = playerId?.trim();
    if (!normalizedPlayerId) {
      throw new BadRequestException('Укажи параметр ?playerId=...');
    }

    try {
      return await this.statsService.getLastMatchByPlayerId(normalizedPlayerId);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || '';
      if (/404|not found|player/i.test(errorMessage)) {
        throw new NotFoundException('Игрок не найден. Проверьте playerId FACEIT.');
      }
      throw new BadGatewayException('Не удалось получить данные матча. Попробуйте позже.');
    }
  }
}
