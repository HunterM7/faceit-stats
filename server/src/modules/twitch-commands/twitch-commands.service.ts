import { Injectable } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';
import type { StatsResponse } from '../../stats/stats.types';

@Injectable()
export class TwitchCommandsService {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Текст ответа для команды `!elo` в чатботе Twitch.
   * @param nickname Ник FACEIT из query.
   */
  async getEloText(nickname?: string): Promise<string> {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      return 'Укажи параметр nickname.';
    }

    try {
      const snapshot = await this.statsService.getPlayerSnapshotByNickname(normalizedNickname);
      if (snapshot.currentElo == null) {
        return 'Эло недоступно.';
      }
      return `Текущее эло: ${snapshot.currentElo}`;
    } catch (error: unknown) {
      return this.toErrorText(error);
    }
  }

  /**
   * Текст ответа для команды `!stats` в чатботе Twitch.
   * @param nickname Ник FACEIT из query.
   */
  async getStatsText(nickname?: string): Promise<string> {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      return 'Укажи параметр nickname.';
    }

    try {
      const stats = await this.statsService.getStatsByNickname(normalizedNickname);
      return this.formatStatsMessage(stats);
    } catch (error: unknown) {
      return this.toErrorText(error);
    }
  }

  private formatStatsMessage(stats: StatsResponse): string {
    const { nickname, common, daily, last30 } = stats;
    const parts = [
      nickname,
      `ELO ${common.elo} (lvl ${common.skillLevel})`,
      `K/D ${this.formatNumber(common.kd)}`,
      `Сегодня ${daily.wins}W-${daily.losses}L`,
      `30 матчей ${last30.wins}W-${last30.losses}L (${last30.winRatePercent}%)`,
      `AVG ${this.formatNumber(last30.avg)}`,
      `ADR ${this.formatNumber(last30.adr)}`,
    ];
    return parts.join(' | ');
  }

  private formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  private toErrorText(error: unknown): string {
    const errorMessage = (error as Error).message || '';
    if (/404|not found|player/i.test(errorMessage)) {
      return 'Игрок не найден. Проверьте никнейм FACEIT.';
    }
    return 'Не удалось получить статистику. Попробуйте позже.';
  }
}
