import { Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { AppConfigService } from '../config/app-config.service';
import {
  type InternalMatchStatsResponse,
  type MatchHistoryResponse,
  type PlayerGlobalRankingResponse,
  type PlayerResponse,
} from '../stats/stats.types';

const FACEIT_BASE_URL = 'https://open.faceit.com/data/v4';

@Injectable()
export class FaceitService {
  private readonly http: AxiosInstance;

  constructor(private readonly config: AppConfigService) {
    this.http = axios.create({
      baseURL: FACEIT_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.config.faceitApiKey}`,
      },
      timeout: 15000,
    });
  }

  async getPlayerByNickname(nickname: string, game?: string): Promise<PlayerResponse> {
    const response = await this.http.get<PlayerResponse>('/players', {
      params: game ? { nickname, game } : { nickname },
    });
    return response.data;
  }

  async getPlayer(playerId: string): Promise<PlayerResponse> {
    const response = await this.http.get<PlayerResponse>(`/players/${playerId}`);
    return response.data;
  }

  async getPlayerHistory(playerId: string, game = 'cs2', limit = 5, offset = 0): Promise<MatchHistoryResponse> {
    const response = await this.http.get<MatchHistoryResponse>(`/players/${playerId}/history`, {
      params: {
        game,
        limit,
        offset,
      },
    });
    return response.data;
  }

  async getPlayerGameStats(playerId: string, game = 'cs2'): Promise<Record<string, unknown>> {
    const response = await this.http.get<Record<string, unknown>>(`/players/${playerId}/stats/${game}`);
    return response.data;
  }

  async getPlayerInternalMatchesStats(playerId: string, game = 'cs2', limit = 30, offset = 0): Promise<InternalMatchStatsResponse> {
    const response = await this.http.get<InternalMatchStatsResponse>(`/players/${playerId}/games/${game}/stats`, {
      params: {
        limit,
        offset,
      },
    });
    return response.data;
  }

  /**
   * Позиция игрока в глобальном рейтинге игры по региону.
   * @see https://docs.faceit.com/docs/data-api/data — Retrieve user position in the global ranking of a game
   */
  async getPlayerRanking(
    gameId: string,
    region: string,
    playerId: string,
    options?: { country?: string; limit?: number },
  ): Promise<PlayerGlobalRankingResponse> {
    const params: Record<string, string | number> = {
      limit: options?.limit ?? 20,
    };
    if (options?.country) {
      params.country = options.country;
    }
    const response = await this.http.get<PlayerGlobalRankingResponse>(
      `/rankings/games/${encodeURIComponent(gameId)}/regions/${encodeURIComponent(region)}/players/${encodeURIComponent(playerId)}`,
      { params },
    );
    return response.data;
  }
}
