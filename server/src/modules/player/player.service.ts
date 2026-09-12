import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { isAxiosError } from 'axios';
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
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException('Игрок не найден. Проверьте никнейм FACEIT.');
      }
      throw new BadGatewayException('Не удалось получить данные игрока. Попробуйте позже.');
    }
  }
}
