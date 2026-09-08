import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { WidgetStatistics } from '@widgets/widget-statistics/widget-statistics';
import { requestStats, type StatsPayload, type StatsRatingQuery } from '@requests/stats';
import { lastMatch, player } from '@requests/matchResult';
import { useStatsWidgetSearchParams } from './use-stats-widget-search-params';
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
  const { nickname, backgroundOpacity, borderRadius, rating } = useStatsWidgetSearchParams();

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
      kr: stats.daily.kr,
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
    if (!nickname) {
      return;
    }

    let cancelled = false;
    playerIdRef.current = null;
    latestMatchIdRef.current = null;
    isPollingRef.current = false;

    requestStats(nickname, analyticsSource, ratingParamForRequest(rating))
      .then((stats) => {
        if (cancelled) {
          return;
        }
        playerIdRef.current = stats.playerId ?? null;
        latestMatchIdRef.current = stats.latestMatchId ?? null;
        setState(mapStatsToState(stats));
      })
      .catch(() => { /* Игнорируем возможные ошибки. */});

    const pollMatchUpdates = async () => {
      if (cancelled || isPollingRef.current) {
        return;
      }
      isPollingRef.current = true;

      try {
        if (!playerIdRef.current) {
          const snapshot = await player(nickname, analyticsSource);
          if (cancelled) {
            return;
          }
          playerIdRef.current = snapshot.playerId ?? null;
        }

        const playerId = playerIdRef.current;
        if (!playerId) {
          return;
        }

        const matchData = await lastMatch(playerId, analyticsSource);
        if (cancelled) {
          return;
        }
        const currentMatchId = matchData.matchId;

        if (!currentMatchId || currentMatchId === latestMatchIdRef.current) {
          return;
        }

        const nextStats = await requestStats(
          nickname,
          analyticsSource,
          ratingParamForRequest(rating),
        );
        if (cancelled) {
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

    const timer = setInterval(pollMatchUpdates, STATS_WIDGET_POLL_MS);
    return () => {
      cancelled = true;
      isPollingRef.current = false;
      clearInterval(timer);
    };
  }, [ nickname, rating ]);

  if (state === undefined) {
    return null;
  }

  return (
    <div className='stats-page'>
      <WidgetStatistics
        common={state.common}
        daily={state.daily}
        recentMatches={state.monthly}
        backgroundOpacity={backgroundOpacity}
        borderRadius={borderRadius}
        className='stats-page__widget'
      />
    </div>
  );
}
