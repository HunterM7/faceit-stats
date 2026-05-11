import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';

@Injectable()
export class LastMatchService {
  constructor(private readonly statsService: StatsService) {}

  async getLastMatchResponse(playerId: string) {
    const id = playerId.trim();

    if (!id) {
      throw new BadRequestException('Укажи параметр playerId.');
    }

    try {
      return await this.statsService.getLastMatchByPlayerId(id);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || '';
      if (errorMessage === 'LAST_MATCH_EMPTY') {
        throw new NotFoundException('У игрока нет матчей в истории FACEIT.');
      }
      if (/404|not found|player/i.test(errorMessage)) {
        throw new NotFoundException('Игрок не найден. Проверьте playerId FACEIT.');
      }
      throw new BadGatewayException('Не удалось получить данные матча. Попробуйте позже.');
    }
  }
}
