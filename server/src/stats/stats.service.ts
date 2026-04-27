import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { FaceitService } from '../faceit/faceit.service';
import {
  type DuoMatchesResponse,
  type LastMatchResponse,
  type MatchHistoryItem,
  type MatchResult,
  type PlayerSnapshotResponse,
  type StatsResponse,
} from './stats.types';

@Injectable()
export class StatsService {
  constructor(
    private readonly config: AppConfigService,
    private readonly faceit: FaceitService,
  ) {}

  getHealth() {
    return {
      ok: true,
      mode: 'stateless',
      gameId: this.config.gameId,
    };
  }

  async getStatsByNickname(rawNickname: string): Promise<StatsResponse> {
    const nickname = rawNickname.trim();
    if (!nickname) {
      throw new Error('Никнейм пустой');
    }

    const player = await this.faceit.getPlayerByNickname(nickname, this.config.gameId);
    const playerId = player.player_id;
    if (!playerId) {
      throw new Error('Игрок FACEIT не найден по никнейму');
    }

    const [ history, gameStatsRaw ] = await Promise.all([
      this.faceit.getPlayerHistory(playerId, this.config.gameId, 30),
      this.faceit.getPlayerGameStats(playerId, this.config.gameId),
    ]);
    const items = history?.items || [];
    const latest = items[0] || null;
    const gameStats = player?.games?.[this.config.gameId] || {};
    const lifetime = this.getLifetimeStats(gameStatsRaw);
    const last30 = this.calculateWindowStats(items, playerId);
    const today = this.calculateTodayStats(items, playerId);
    const fallback = this.buildLifetimeFallback(lifetime);

    return {
      nickname: player.nickname || nickname,
      country: player.country?.toUpperCase() || null,
      playerId,
      gameId: this.config.gameId,
      faceitElo: typeof gameStats.faceit_elo === 'number' ? gameStats.faceit_elo : null,
      skillLevel: typeof gameStats.skill_level === 'number' ? gameStats.skill_level : null,
      winRate: this.pickNumber(lifetime, [ 'Win Rate %', 'Win Rate' ]),
      averageKills: this.pickNumber(lifetime, [ 'Average Kills', 'Avg Kills' ]) ?? fallback.averageKills,
      averageAdr: this.pickNumber(lifetime, [ 'ADR', 'Average ADR' ]),
      kdRatio: this.pickNumber(lifetime, [ 'Average K/D Ratio', 'K/D Ratio' ]),
      krRatio: this.pickNumber(lifetime, [ 'K/R Ratio', 'Average K/R Ratio' ]) ?? fallback.krRatio,
      last30Wins: last30.wins,
      last30Losses: last30.losses,
      todayWins: today.wins,
      todayLosses: today.losses,
      latestMatchId: latest?.match_id || null,
      latestMatchStatus: latest?.status || null,
      latestMatchResult: this.resolveResultForPlayer(latest, playerId),
      updatedAt: new Date().toISOString(),
      raw: {
        player,
        gameStats: gameStatsRaw,
        history,
      },
    };
  }

  async getLastMatchByPlayerId(playerId: string): Promise<LastMatchResponse> {
    const normalizedPlayerId = playerId.trim();
    if (!normalizedPlayerId) {
      throw new Error('playerId пустой');
    }

    const [ player, history ] = await Promise.all([
      this.faceit.getPlayer(normalizedPlayerId),
      this.faceit.getPlayerHistory(normalizedPlayerId, this.config.gameId, 1),
    ]);
    const latest = history?.items?.[0] || null;
    const gameStats = player?.games?.[this.config.gameId] || {};
    const currentElo = typeof gameStats.faceit_elo === 'number' ? gameStats.faceit_elo : null;
    const currentSkillLevel = typeof gameStats.skill_level === 'number' ? gameStats.skill_level : null;

    return {
      matchId: latest?.match_id || null,
      status: latest?.status || null,
      result: this.resolveResultForPlayer(latest, normalizedPlayerId),
      currentElo,
      currentSkillLevel,
      finishedAt: latest?.finished_at ? new Date(latest.finished_at * 1000).toISOString() : null,
      updatedAt: new Date().toISOString(),
      raw: {
        player,
        history,
        latestMatch: latest,
      },
    };
  }

  async getPlayerSnapshotByNickname(rawNickname: string): Promise<PlayerSnapshotResponse> {
    const nickname = rawNickname.trim();
    if (!nickname) {
      throw new Error('Никнейм пустой');
    }

    const player = await this.faceit.getPlayerByNickname(nickname, this.config.gameId);
    const gameStats = player?.games?.[this.config.gameId] || {};
    const currentElo = typeof gameStats.faceit_elo === 'number' ? gameStats.faceit_elo : null;
    const currentSkillLevel = typeof gameStats.skill_level === 'number' ? gameStats.skill_level : null;

    return {
      playerId: player.player_id || null,
      nickname: player.nickname || nickname,
      gameId: this.config.gameId,
      currentElo,
      currentSkillLevel,
      updatedAt: new Date().toISOString(),
    };
  }

  async getDuoMatchesInCsgo(rawNickname: string, rawTeammateNickname: string): Promise<DuoMatchesResponse> {
    const nickname = rawNickname.trim();
    const teammateNickname = rawTeammateNickname.trim();
    if (!nickname || !teammateNickname) {
      throw new Error('Параметры nickname и teammateNickname обязательны');
    }

    const gameId = 'csgo';
    const [ player, teammate ] = await Promise.all([
      this.faceit.getPlayerByNickname(nickname),
      this.faceit.getPlayerByNickname(teammateNickname),
    ]);

    const playerId = player.player_id;
    const teammateId = teammate.player_id;
    if (!playerId || !teammateId) {
      throw new Error('Игрок FACEIT не найден по никнейму');
    }

    const items = await this.loadAllPlayerHistory(playerId, gameId);
    const matches = items
      .map((item) => this.mapDuoMatch(item, playerId, teammateId))
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      nickname: player.nickname || nickname,
      teammateNickname: teammate.nickname || teammateNickname,
      gameId,
      totalChecked: items.length,
      totalTogether: matches.length,
      matches,
    };
  }

  private getLifetimeStats(stats: Record<string, unknown>): Record<string, unknown> {
    const maybeLifetime = stats?.lifetime;
    if (typeof maybeLifetime === 'object' && maybeLifetime) {
      return maybeLifetime as Record<string, unknown>;
    }
    return {};
  }

  private pickNumber(source: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
      const raw = source[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
      if (typeof raw === 'string') {
        const normalized = raw.replace(',', '.').replace('%', '').trim();
        const value = Number(normalized);
        if (Number.isFinite(value)) return value;
      }
    }
    return null;
  }

  private buildLifetimeFallback(source: Record<string, unknown>): { averageKills: number | null; krRatio: number | null } {
    const totalKills = this.pickNumber(source, [ 'Total Kills with extended stats' ]);
    const totalMatches = this.pickNumber(source, [ 'Total Matches' ]);
    const totalRounds = this.pickNumber(source, [ 'Total Rounds with extended stats' ]);

    const averageKills = totalKills && totalMatches ? totalKills / totalMatches : null;
    const krRatio = totalKills && totalRounds ? totalKills / totalRounds : null;
    return { averageKills, krRatio };
  }

  private calculateWindowStats(items: MatchHistoryItem[], playerId: string): { wins: number; losses: number } {
    let wins = 0;
    let losses = 0;
    for (const item of items) {
      const result = this.resolveResultForPlayer(item, playerId);
      if (result === 'WIN') wins += 1;
      if (result === 'LOSS') losses += 1;
    }
    return { wins, losses };
  }

  private calculateTodayStats(items: MatchHistoryItem[], playerId: string): { wins: number; losses: number } {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    let wins = 0;
    let losses = 0;

    for (const item of items) {
      if (!item.finished_at) continue;
      const playedAt = new Date(item.finished_at * 1000);
      if (playedAt.getUTCFullYear() !== year || playedAt.getUTCMonth() !== month || playedAt.getUTCDate() !== day) {
        continue;
      }
      const result = this.resolveResultForPlayer(item, playerId);
      if (result === 'WIN') wins += 1;
      if (result === 'LOSS') losses += 1;
    }

    return { wins, losses };
  }

  private resolveResultForPlayer(match: MatchHistoryItem | null, playerId: string): MatchResult {
    if (!match) return 'UNKNOWN';
    const winnerFactionId = match.results?.winner;
    if (!winnerFactionId) return 'UNKNOWN';

    const teams = match.teams || {};
    let playerFactionId: string | null = null;
    for (const [ factionId, team ] of Object.entries(teams)) {
      const hasPlayer = Array.isArray(team.players) && team.players.some((p) => p.player_id === playerId);
      if (hasPlayer) {
        playerFactionId = factionId;
        break;
      }
    }

    if (!playerFactionId) return 'UNKNOWN';
    return playerFactionId === winnerFactionId ? 'WIN' : 'LOSS';
  }

  private getPlayerFactionId(match: MatchHistoryItem | null, playerId: string): string | null {
    if (!match) return null;
    const teams = match.teams || {};
    for (const [ factionId, team ] of Object.entries(teams)) {
      const hasPlayer = Array.isArray(team.players) && team.players.some((p) => p.player_id === playerId);
      if (hasPlayer) return factionId;
    }
    return null;
  }

  private mapDuoMatch(match: MatchHistoryItem, playerId: string, teammateId: string) {
    const playerFactionId = this.getPlayerFactionId(match, playerId);
    const teammateFactionId = this.getPlayerFactionId(match, teammateId);
    if (!playerFactionId || playerFactionId !== teammateFactionId) {
      return null;
    }

    const score = match.results?.score || {};
    const enemyFactionId = Object.keys(match.teams || {}).find((id) => id !== playerFactionId) || null;

    return {
      matchId: match.match_id || 'unknown',
      finishedAt: match.finished_at ? new Date(match.finished_at * 1000).toISOString() : null,
      status: match.status || null,
      result: this.resolveResultForPlayer(match, playerId),
      teamScore: this.toFiniteNumber(score[playerFactionId]),
      enemyScore: enemyFactionId ? this.toFiniteNumber(score[enemyFactionId]) : null,
      faceitUrl: match.match_id ? `https://www.faceit.com/en/csgo/room/${match.match_id}` : null,
    };
  }

  private async loadAllPlayerHistory(playerId: string, gameId: string): Promise<MatchHistoryItem[]> {
    const pageSize = 100;
    const maxPages = 50;
    const allItems: MatchHistoryItem[] = [];

    for (let page = 0; page < maxPages; page += 1) {
      const offset = page * pageSize;
      const response = await this.faceit.getPlayerHistory(playerId, gameId, pageSize, offset);
      const items = response?.items || [];
      if (items.length === 0) break;
      allItems.push(...items);
      if (items.length < pageSize) break;
    }

    return allItems;
  }

  private toFiniteNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(',', '.').trim());
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  }
}
