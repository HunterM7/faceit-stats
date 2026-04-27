import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';

@Injectable()
export class PlayerService {
  constructor(private readonly statsService: StatsService) {}

  async getPlayerSnapshotResponse(nickname?: string) {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      throw new BadRequestException('Укажи параметр ?nickname=...');
    }

    try {
      return await this.statsService.getPlayerSnapshotByNickname(normalizedNickname);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || '';
      if (/404|not found|player/i.test(errorMessage)) {
        throw new NotFoundException('Игрок не найден. Проверьте никнейм FACEIT.');
      }
      throw new BadGatewayException('Не удалось получить данные игрока. Попробуйте позже.');
    }
  }
}
