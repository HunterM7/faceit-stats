import axios, { AxiosInstance } from "axios";
import { Injectable } from "@nestjs/common";
import { AppConfigService } from "./app-config.service";
import { MatchHistoryResponse, PlayerResponse } from "./types";

const FACEIT_BASE_URL = "https://open.faceit.com/data/v4";

@Injectable()
export class FaceitService {
  private readonly http: AxiosInstance;

  constructor(private readonly config: AppConfigService) {
    this.http = axios.create({
      baseURL: FACEIT_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.config.faceitApiKey}`
      },
      timeout: 15000
    });
  }

  async getPlayerByNickname(nickname: string, game?: string): Promise<PlayerResponse> {
    const response = await this.http.get<PlayerResponse>("/players", {
      params: game ? { nickname, game } : { nickname }
    });
    return response.data;
  }

  async getPlayer(playerId: string): Promise<PlayerResponse> {
    const response = await this.http.get<PlayerResponse>(`/players/${playerId}`);
    return response.data;
  }

  async getPlayerHistory(playerId: string, game = "cs2", limit = 5, offset = 0): Promise<MatchHistoryResponse> {
    const response = await this.http.get<MatchHistoryResponse>(`/players/${playerId}/history`, {
      params: {
        game,
        limit,
        offset
      }
    });
    return response.data;
  }

  async getPlayerGameStats(playerId: string, game = "cs2"): Promise<Record<string, unknown>> {
    const response = await this.http.get<Record<string, unknown>>(`/players/${playerId}/stats/${game}`);
    return response.data;
  }
}
