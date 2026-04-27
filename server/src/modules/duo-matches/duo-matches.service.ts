import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';

@Injectable()
export class DuoMatchesService {
  constructor(private readonly statsService: StatsService) {}

  async getDuoMatchesResponse(nickname?: string, teammateNickname?: string) {
    const normalizedNickname = nickname?.trim();
    const normalizedTeammateNickname = teammateNickname?.trim();
    if (!normalizedNickname || !normalizedTeammateNickname) {
      throw new BadRequestException('Укажи параметры ?nickname=...&teammateNickname=...');
    }

    try {
      return await this.statsService.getDuoMatchesInCsgo(normalizedNickname, normalizedTeammateNickname);
    } catch {
      throw new BadGatewayException('Не удалось получить совместные матчи');
    }
  }
}
