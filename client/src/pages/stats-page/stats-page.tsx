import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { WidgetStatistics } from '@widgets/widget-statistics/widget-statistics';
import { requestStats, type StatsPayload, type StatsRatingQuery } from '@requests/stats';
import { lastMatch, player } from '@requests/matchResult';
import './stats-page.scss';

const STATS_WIDGET_POLL_MS = import.meta.env.DEV ? 5000 : 20000;

/** Без `rating` и для `country` API по умолчанию отдаёт только страну — параметр не дублируем. */
function ratingParamForRequest(rating: StatsRatingQuery | undefined): StatsRatingQuery | undefined {
  if (rating === undefined || rating === 'country') {
    return undefined;
  }
  return rating;
}

type StatsState = {
  common: ComponentProps<typeof WidgetStatistics>['common'];
  daily: ComponentProps<typeof WidgetStatistics>['daily'];
  monthly: ComponentProps<typeof WidgetStatistics>['recentMatches'];
};

export function StatsPage() {
  const analyticsSource = 'stats_widget';
  const location = useLocation();
  const [ searchParams, setSearchParams ] = useSearchParams();

  const rawNickname = searchParams.get('nickname');
  const rawBg = searchParams.get('bg');
  const rawRadius = searchParams.get('radius');
  const nicknameParam = rawNickname?.trim();
  const backgroundOpacityParam = (() => {
    if (!rawBg) {
      return undefined;
    }
    if (!/^\d+$/.test(rawBg)) {
      return undefined;
    }
    const parsed = Number(rawBg);
    if (parsed < 0 || parsed > 100) {
      return undefined;
    }
    return parsed;
  })();

  const borderRadiusParam = (() => {
    if (!rawRadius) {
      return undefined;

    }
    if (!/^\d+$/.test(rawRadius)) {
      return undefined;
    }
    const parsed = Number(rawRadius);
    if (parsed < 0 || parsed > 18) {
      return undefined;
    }
    return parsed;
  })();

  const rawRating = searchParams.get('rating');
  const ratingParam =
    rawRating === 'country' || rawRating === 'region' || rawRating === 'both' ? rawRating : undefined;

  const [ state, setState ] = useState<StatsState | undefined>(undefined);
  const playerIdRef = useRef<string | null>(null);
  const latestMatchIdRef = useRef<string | null>(null);
  const isPollingRef = useRef(false);

  const mapStatsToState = (stats: StatsPayload): StatsState => ({
    common: {
      skillLevel: stats.common.skillLevel,
      elo: stats.common.elo,
      kd: stats.common.kd,
      rank: stats.common.rank,
    },
    daily: {
      wins: stats.daily.wins,
      losses: stats.daily.losses,
      avg: stats.daily.avg,
      adr: stats.daily.adr,
      kd: stats.daily.kd,
    },
    monthly: {
      winRatePercent: stats.last30.winRatePercent,
      matchResults: stats.last30.matchResults,
      avg: stats.last30.avg,
      adr: stats.last30.adr,
      kd: stats.last30.kd,
      kr: stats.last30.kr,
    },
  });

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      const nextParams = new URLSearchParams();
      nextParams.set('nickname', rawNickname ?? '');
      if (backgroundOpacityParam !== undefined) {
        nextParams.set('bg', String(backgroundOpacityParam));
      }
      if (borderRadiusParam !== undefined) {
        nextParams.set('radius', String(borderRadiusParam));
      }
      if (ratingParam) {
        nextParams.set('rating', ratingParam);
      }

      const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search);
      if (hasNicknameWithoutEquals || nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
        return;
      }

      if (!nicknameParam) {
        return;
      }

      try {
        const stats: StatsPayload = await requestStats(
          nicknameParam,
          analyticsSource,
          ratingParamForRequest(ratingParam),
        );

        if (!mounted || !stats) {
          return;
        }

        playerIdRef.current = stats.playerId ?? null;
        latestMatchIdRef.current = stats.latestMatchId ?? null;
        setState(mapStatsToState(stats));
      } catch {
        if (!mounted) {
          return;
        }
        // Keep the last successful state on transient fetch errors.
      }
    };

    const pollMatchUpdates = async () => {
      if (isPollingRef.current || !nicknameParam) {
        return;
      }
      isPollingRef.current = true;

      try {
        if (!playerIdRef.current) {
          const snapshot = await player(nicknameParam, analyticsSource);
          playerIdRef.current = snapshot.playerId ?? null;
        }

        const playerId = playerIdRef.current;
        if (!playerId) {
          return;
        }

        const matchData = await lastMatch(playerId, analyticsSource);
        const currentMatchId = matchData.matchId;

        if (!latestMatchIdRef.current) {
          latestMatchIdRef.current = currentMatchId;
          return;
        }

        if (!currentMatchId || currentMatchId === latestMatchIdRef.current) {
          return;
        }

        latestMatchIdRef.current = currentMatchId;
        const nextStats = await requestStats(
          nicknameParam,
          analyticsSource,
          ratingParamForRequest(ratingParam),
        );
        if (!mounted || !nextStats) {
          return;
        }

        playerIdRef.current = nextStats.playerId ?? playerIdRef.current;
        latestMatchIdRef.current = nextStats.latestMatchId ?? currentMatchId;
        setState(mapStatsToState(nextStats));
      } catch {
        // Keep the last successful state on transient polling errors.
      } finally {
        isPollingRef.current = false;
      }
    };

    refresh();
    const timer = window.setInterval(pollMatchUpdates, STATS_WIDGET_POLL_MS);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [ backgroundOpacityParam, borderRadiusParam, location.search, nicknameParam, ratingParam, rawNickname, searchParams, setSearchParams ]);

  if (state === undefined) {
    return null;
  }

  return (
    <div className='stats-page'>
      <WidgetStatistics
        common={state.common}
        daily={state.daily}
        recentMatches={state.monthly}
        backgroundOpacity={backgroundOpacityParam}
        borderRadius={borderRadiusParam}
        className='stats-page__widget'
      />
    </div>
  );
}
