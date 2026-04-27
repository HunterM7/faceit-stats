import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { AppConfigService } from "./app-config.service";
import { StatsService } from "./stats.service";

@Controller()
export class AppController {
  constructor(
    private readonly config: AppConfigService,
    private readonly statsService: StatsService
  ) { }

  @Get("health")
  getHealth() {
    return this.statsService.getHealth();
  }

  @Get("api/playerStatistics")
  async getPlayerStatistics(@Query("nickname") nickname?: string) {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      throw new BadRequestException("Provide ?nickname=...");
    }

    try {
      const stats = await this.statsService.getStatsByNickname(normalizedNickname);
      return { ok: true, playerStatistics: stats };
    } catch (error: unknown) {
      return {
        ok: false,
        message: "Failed to fetch player stats",
        error: (error as Error).message
      };
    }
  }

  @Get("api/lastMatch")
  async getLastMatch(@Query("playerId") playerId?: string) {
    const normalizedPlayerId = playerId?.trim();
    if (!normalizedPlayerId) {
      return {
        ok: false,
        message: "Provide ?playerId=...",
        lastMatch: {
          matchId: null,
          status: null,
          result: "UNKNOWN",
          currentElo: null,
          currentSkillLevel: null,
          finishedAt: null,
          updatedAt: new Date().toISOString(),
          raw: {
            player: {},
            history: {},
            latestMatch: null
          }
        }
      };
    }

    try {
      const lastMatch = await this.statsService.getLastMatchByPlayerId(normalizedPlayerId);
      return { ok: true, lastMatch };
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "";
      const isPlayerNotFound = /404|not found|player/i.test(errorMessage);
      return {
        ok: false,
        message: isPlayerNotFound
          ? "Игрок не найден. Проверьте playerId FACEIT."
          : "Не удалось получить данные матча. Попробуйте позже.",
        error: errorMessage,
        lastMatch: {
          matchId: null,
          status: null,
          result: "UNKNOWN",
          currentElo: null,
          currentSkillLevel: null,
          finishedAt: null,
          updatedAt: new Date().toISOString(),
          raw: {
            player: {},
            history: {},
            latestMatch: null
          }
        }
      };
    }
  }

  @Get("api/player")
  async getPlayerSnapshot(@Query("nickname") nickname?: string) {
    const normalizedNickname = nickname?.trim();
    if (!normalizedNickname) {
      return {
        ok: false,
        message: "Provide ?nickname=...",
        player: {
          playerId: null,
          nickname: "Unknown",
          gameId: this.config.gameId,
          currentElo: null,
          currentSkillLevel: null,
          updatedAt: new Date().toISOString()
        }
      };
    }

    try {
      const player = await this.statsService.getPlayerSnapshotByNickname(normalizedNickname);
      return { ok: true, player };
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "";
      const isNicknameNotFound = /404|not found|player/i.test(errorMessage);
      return {
        ok: false,
        message: isNicknameNotFound
          ? "Игрок не найден. Проверьте никнейм FACEIT."
          : "Не удалось получить данные игрока. Попробуйте позже.",
        error: errorMessage,
        player: {
          playerId: null,
          nickname: normalizedNickname,
          gameId: this.config.gameId,
          currentElo: null,
          currentSkillLevel: null,
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  @Get("api/duoMatches")
  async getDuoMatches(
    @Query("nickname") nickname?: string,
    @Query("teammateNickname") teammateNickname?: string
  ) {
    const normalizedNickname = nickname?.trim();
    const normalizedTeammateNickname = teammateNickname?.trim();
    if (!normalizedNickname || !normalizedTeammateNickname) {
      throw new BadRequestException("Provide ?nickname=...&teammateNickname=...");
    }

    try {
      const data = await this.statsService.getDuoMatchesInCsgo(normalizedNickname, normalizedTeammateNickname);
      return { ok: true, duoMatches: data };
    } catch (error: unknown) {
      return {
        ok: false,
        message: "Failed to fetch duo matches",
        error: (error as Error).message
      };
    }
  }
}
