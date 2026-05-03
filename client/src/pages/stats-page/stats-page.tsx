import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { WidgetStatistics } from '@widgets/widget-statistics/widget-statistics'
import { requestStats, type StatsPayload, type Rank, type StatsRatingQuery } from '@requests/stats'
import { lastMatch, player } from '@requests/matchResult'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import './stats-page.scss'

/** Без `rating` и для `country` API по умолчанию отдаёт только страну — параметр не дублируем. */
function ratingParamForRequest(rating: StatsRatingQuery | undefined): StatsRatingQuery | undefined {
  if (rating === undefined || rating === 'country') {
    return undefined
  }
  return rating
}

type StatsState = {
  common: {
    level: number;
    elo: number;
    kd: number;
    rank: Rank;
  };
  daily: {
    wins: number;
    losses: number;
    averageKills: number;
    averageAdr: number;
    kd: number;
  };
  monthly: {
    winRate: number;
    matchResults: boolean[];
    averageKills: number;
    averageAdr: number;
    kd: number;
    krRatio: number;
  };
}

export function StatsPage() {
  const analyticsSource = 'stats_widget'
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()

  const rawNickname = searchParams.get('nickname')
  const rawBg = searchParams.get('bg')
  const rawRadius = searchParams.get('radius')
  const nicknameParam = rawNickname?.trim()
  const backgroundOpacityParam = (() => {
    if (!rawBg) return undefined
    if (!/^\d+$/.test(rawBg)) return undefined
    const parsed = Number(rawBg)
    if (parsed < 0 || parsed > 100) return undefined
    return parsed
  })()

  const borderRadiusParam = (() => {
    if (!rawRadius) return undefined
    if (!/^\d+$/.test(rawRadius)) return undefined
    const parsed = Number(rawRadius)
    if (parsed < 0 || parsed > 18) return undefined
    return parsed
  })()

  const rawRating = searchParams.get('rating')
  const ratingParam =
    rawRating === 'country' || rawRating === 'region' || rawRating === 'both' ? rawRating : undefined

  const [ state, setState ] = useState<StatsState | undefined>(undefined)
  const playerIdRef = useRef<string | null>(null)
  const latestMatchIdRef = useRef<string | null>(null)
  const isPollingRef = useRef(false)

  const mapStatsToState = (stats: StatsPayload): StatsState => ({
    common: {
      level: stats.common.skillLevel,
      elo: stats.common.faceitElo,
      kd: stats.common.kd,
      rank: stats.common.rank,
    },
    daily: {
      wins: stats.daily.wins,
      losses: stats.daily.losses,
      averageKills: stats.daily.averageKills,
      averageAdr: stats.daily.averageAdr,
      kd: stats.daily.kd,
    },
    monthly: {
      winRate: stats.last30.winRate,
      matchResults: stats.last30.matchResults ?? [],
      averageKills: stats.last30.averageKills,
      averageAdr: stats.last30.averageAdr,
      kd: stats.last30.kd,
      krRatio: stats.last30.krRatio,
    },
  })

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      const nextParams = new URLSearchParams()
      nextParams.set('nickname', rawNickname ?? '')
      if (backgroundOpacityParam !== undefined) {
        nextParams.set('bg', String(backgroundOpacityParam))
      }
      if (borderRadiusParam !== undefined) {
        nextParams.set('radius', String(borderRadiusParam))
      }
      if (ratingParam) {
        nextParams.set('rating', ratingParam)
      }

      const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search)
      if (hasNicknameWithoutEquals || nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true })
        return
      }

      if (!nicknameParam) {
        return
      }

      try {
        const stats: StatsPayload = await requestStats(
          nicknameParam,
          analyticsSource,
          ratingParamForRequest(ratingParam),
        )

        if (!mounted || !stats) {
          return
        }

        playerIdRef.current = stats.playerId ?? null
        latestMatchIdRef.current = stats.latestMatchId ?? null
        setState(mapStatsToState(stats))
      } catch {
        if (!mounted) return
        // Keep the last successful state on transient fetch errors.
      }
    }

    const pollMatchUpdates = async () => {
      if (isPollingRef.current || !nicknameParam) {
        return
      }
      isPollingRef.current = true

      try {
        if (!playerIdRef.current) {
          const snapshot = await player(nicknameParam, analyticsSource)
          playerIdRef.current = snapshot.playerId ?? null
        }

        const playerId = playerIdRef.current
        if (!playerId) {
          return
        }

        const matchData = await lastMatch(playerId, analyticsSource)
        const currentMatchId = matchData.matchId ?? null

        if (!latestMatchIdRef.current) {
          latestMatchIdRef.current = currentMatchId
          return
        }

        if (!currentMatchId || currentMatchId === latestMatchIdRef.current) {
          return
        }

        latestMatchIdRef.current = currentMatchId
        const nextStats = await requestStats(
          nicknameParam,
          analyticsSource,
          ratingParamForRequest(ratingParam),
        )
        if (!mounted || !nextStats) {
          return
        }

        playerIdRef.current = nextStats.playerId ?? playerIdRef.current
        latestMatchIdRef.current = nextStats.latestMatchId ?? currentMatchId
        setState(mapStatsToState(nextStats))
      } catch {
        // Keep the last successful state on transient polling errors.
      } finally {
        isPollingRef.current = false
      }
    }

    refresh()
    const timer = window.setInterval(pollMatchUpdates, 10000)
    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [ backgroundOpacityParam, borderRadiusParam, location.search, nicknameParam, ratingParam, rawNickname, searchParams, setSearchParams ])

  if (state === undefined) {
    return null
  }

  const dailyAvgKillsAdr =
    `${formatNumberWithFixedDecimals(state.daily.averageKills, 0)} / ${formatNumberWithFixedDecimals(state.daily.averageAdr, 0)}`
  const monthlyAvgKillsAdr =
    `${formatNumberWithFixedDecimals(state.monthly.averageKills, 0)} / ${formatNumberWithFixedDecimals(state.monthly.averageAdr, 0)}`
  const monthlyKdKr = `${formatNumberWithFixedDecimals(state.monthly.kd, 2)} / ${formatNumberWithFixedDecimals(state.monthly.krRatio, 2)}`

  const common: ComponentProps<typeof WidgetStatistics>['common'] = {
    level: state.common.level,
    elo: state.common.elo,
    kd: state.common.kd,
    rank: state.common.rank,
  }

  const daily = {
    todayWins: state.daily.wins,
    todayLosses: state.daily.losses,
    avgKillsAdr: dailyAvgKillsAdr,
    kd: state.daily.kd,
  }

  const monthly = {
    winRatePercent: state.monthly.winRate,
    last30MatchResults: state.monthly.matchResults,
    avgKillsAdr: monthlyAvgKillsAdr,
    kdKr: monthlyKdKr,
  }

  return (
    <div className='stats-page'>
      <WidgetStatistics
        common={common}
        daily={daily}
        monthly={monthly}
        backgroundOpacityPercent={backgroundOpacityParam}
        borderRadius={borderRadiusParam}
        className='stats-page__widget'
      />
    </div>
  )
}
