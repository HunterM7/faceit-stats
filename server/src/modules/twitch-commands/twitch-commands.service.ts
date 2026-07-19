import { Injectable } from '@nestjs/common';
import { StatsService } from '../../stats/stats.service';
import type { StatsResponse } from '../../stats/stats.types';

const DEFAULT_ELO_TEXT = 'Текущее эло: {elo}';

/** Максимальная длина пользовательского шаблона ответа !elo. */
const MAX_TEXT_LENGTH = 250;

@Injectable()
export class TwitchCommandsService {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Сырое значение `elo` или `level` для вставки чатботом в текст команды.
   */
  async getFieldText(nickname?: string, name?: string): Promise<string> {
    const normalizedNickname = nickname?.trim();
    const field = name?.trim();
    if (!normalizedNickname) {
      return 'Укажи параметр nickname.';
    }
    if (field !== 'elo' && field !== 'level') {
      return 'Неизвестное поле.';
    }

    try {
      const snapshot = await this.statsService.getPlayerSnapshotByNickname(normalizedNickname);
      if (field === 'elo') {
        return snapshot.currentElo == null ? '—' : String(snapshot.currentElo);
      }
      return snapshot.currentSkillLevel == null ? '—' : String(snapshot.currentSkillLevel);
    } catch (error: unknown) {
      return this.toErrorText(error);
    }
  }

  /**
   * Полный текст !elo по шаблону — для Moobot.
   */
  async getEloMessageText(nickname?: string, text?: string): Promise<string> {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      return 'Укажи параметр nickname.';
    }

    const template = this.normalizeText(text, DEFAULT_ELO_TEXT);

    try {
      const snapshot = await this.statsService.getPlayerSnapshotByNickname(normalizedNickname);
      if (snapshot.currentElo == null) {
        return 'Эло недоступно.';
      }
      return this.applyTemplate(template, {
        elo: String(snapshot.currentElo),
        level: snapshot.currentSkillLevel == null ? '—' : String(snapshot.currentSkillLevel),
      });
    } catch (error: unknown) {
      return this.toErrorText(error);
    }
  }

  /**
   * Готовая строка !stats (фиксированный формат).
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
    return [
      nickname,
      `ELO ${common.elo} (lvl ${common.skillLevel})`,
      `K/D ${this.formatNumber(common.kd)}`,
      `Сегодня ${daily.wins}W-${daily.losses}L`,
      `30 матчей ${last30.wins}W-${last30.losses}L (${last30.winRatePercent}%)`,
      `AVG ${this.formatNumber(last30.avg)}`,
      `ADR ${this.formatNumber(last30.adr)}`,
    ].join(' | ');
  }

  private normalizeText(text: string | undefined, fallback: string): string {
    const trimmed = text?.trim();
    if (!trimmed) {
      return fallback;
    }
    return trimmed.slice(0, MAX_TEXT_LENGTH);
  }

  private applyTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{([a-zA-Z]+)\}/g, (match, key: string) => {
      const value = vars[key];
      return value === undefined ? match : value;
    });
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
