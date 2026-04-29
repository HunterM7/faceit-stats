import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { FaceitService } from '../faceit/faceit.service';
import {
  type InternalMatchStatsItem,
  type DuoMatchesResponse,
  type LastMatchResponse,
  type MatchHistoryItem,
  type MatchResult,
  type PlayerSnapshotResponse,
  type StatsResponse,
} from './stats.types';

type ParsedInternalMatch = {
  isWin: boolean;
  kills: number;
  deaths: number;
  rounds: number;
  damage: number;
  finishedAtMs: number | null;
};

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

    const [ history, gameStatsRaw, internalStats ] = await Promise.all([
      this.faceit.getPlayerHistory(playerId, this.config.gameId, 30),
      this.faceit.getPlayerGameStats(playerId, this.config.gameId),
      this.faceit.getPlayerInternalMatchesStats(playerId, this.config.gameId, 30),
    ]);
    const items = history?.items || [];
    const latest = items[0] || null;
    const gameStats = player?.games?.[this.config.gameId] || {};
    const lifetime = this.getLifetimeStats(gameStatsRaw);
    const internalItems = (internalStats?.items || [])
      .map((item) => this.parseInternalMatch(item))
      .filter((item): item is ParsedInternalMatch => item !== null);
    const last30 = this.aggregateInternalMatches(internalItems);
    const todayStartMs = this.getDailyStartMs(7);
    const today = this.aggregateInternalMatches(
      internalItems.filter((item) => item.finishedAtMs !== null && item.finishedAtMs > todayStartMs),
    );
    const fallback = this.buildLifetimeFallback(lifetime);
    const faceitElo = typeof gameStats.faceit_elo === 'number' ? gameStats.faceit_elo : 0;
    const skillLevel = typeof gameStats.skill_level === 'number' ? gameStats.skill_level : 0;
    const commonKdRatio = this.pickNumber(lifetime, [ 'Average K/D Ratio', 'K/D Ratio' ]) ?? 0;
    const rankLabel = faceitElo ? `#${Math.max(1, Math.round(5000 - faceitElo)).toString()}` : '#----';

    return {
      nickname: player.nickname || nickname,
      country: player.country?.toUpperCase() || null,
      playerId,
      gameId: this.config.gameId,
      common: {
        faceitElo,
        skillLevel,
        kdRatio: commonKdRatio,
        rankLabel,
      },
      daily: {
        wins: today.wins,
        losses: today.losses,
        averageKills: today.avgKills,
        averageAdr: today.adr,
        kdRatio: today.avgKD,
      },
      last30: {
        wins: last30.wins,
        losses: last30.losses,
        winRate: last30.winRate,
        averageKills: last30.avgKills,
        averageAdr: last30.adr,
        kdRatio: last30.avgKD,
        krRatio: last30.avgKR || fallback.krRatio || 0,
      },
      latestMatchId: latest?.match_id || null,
      latestMatchStatus: latest?.status || null,
      latestMatchResult: this.resolveResultForPlayer(latest, playerId),
      updatedAt: new Date().toISOString(),
      raw: {
        player,
        gameStats: gameStatsRaw,
        history,
        internalStats,
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

  private parseInternalMatch(item: InternalMatchStatsItem): ParsedInternalMatch | null {
    const stats = item?.stats || {};
    const kills = this.toFiniteNumber(stats.Kills);
    const deaths = this.toFiniteNumber(stats.Deaths);
    const rounds = this.toFiniteNumber(stats.Rounds);
    const damage = this.toFiniteNumber(stats.Damage);
    const result = stats.Result;
    const finishedAtMs = this.toFiniteNumber(stats['Match Finished At']);

    if (kills === null || deaths === null || rounds === null || damage === null) {
      return null;
    }

    return {
      isWin: result === '1',
      kills,
      deaths,
      rounds,
      damage,
      finishedAtMs,
    };
  }

  private aggregateInternalMatches(items: ParsedInternalMatch[]): {
    wins: number;
    losses: number;
    winRate: number;
    avgKills: number;
    avgKD: number;
    avgKR: number;
    adr: number;
  } {
    if (items.length === 0) {
      return {
        wins: 0,
        losses: 0,
        winRate: 0,
        avgKills: 0,
        avgKD: 0,
        avgKR: 0,
        adr: 0,
      };
    }

    const summary = items.reduce((acc, item) => {
      if (item.isWin) {
        acc.wins += 1;
      } else {
        acc.losses += 1;
      }
      acc.kills += item.kills;
      acc.deaths += item.deaths;
      acc.rounds += item.rounds;
      acc.damage += item.damage;
      return acc;
    }, {
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      rounds: 0,
      damage: 0,
    });

    const totalMatches = items.length;
    return {
      wins: summary.wins,
      losses: summary.losses,
      winRate: Math.floor((summary.wins / totalMatches) * 100),
      avgKills: Math.round(summary.kills / totalMatches),
      avgKD: this.roundFixed(summary.kills / summary.deaths),
      avgKR: this.roundFixed(summary.kills / summary.rounds),
      adr: this.roundFixed(summary.damage / summary.rounds),
    };
  }

  private getDailyStartMs(startHour: number): number {
    const now = new Date();
    if (now.getHours() < startHour) {
      now.setDate(now.getDate() - 1);
    }
    now.setHours(startHour, 0, 0, 0);
    return now.getTime();
  }

  private roundFixed(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
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
