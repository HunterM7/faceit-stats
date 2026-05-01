import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { StatsWidgetCard } from '@components/stats-widget-card/stats-widget-card'
import { requestStats, type StatsPayload } from '@requests/stats'
import { lastMatch, player } from '@requests/matchResult'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import './stats-page.scss'

type StatsState = {
  country: string | null;
  common: {
    level: number;
    elo: number;
    kdRatio: number;
    rankLabel: string;
  };
  daily: {
    wins: number;
    losses: number;
    averageKills: number;
    averageAdr: number;
    kdRatio: number;
  };
  monthly: {
    winRate: number;
    averageKills: number;
    averageAdr: number;
    kdRatio: number;
    krRatio: number;
  };
}

export function StatsPage() {
  const analyticsSource = 'stats_widget'
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()

  const rawNickname = searchParams.get('nickname')
  const rawBg = searchParams.get('bg')
  const nicknameParam = rawNickname?.trim()
  const backgroundOpacityParam = (() => {
    if (!rawBg) return undefined
    if (!/^\d+$/.test(rawBg)) return undefined
    const parsed = Number(rawBg)
    if (parsed < 0 || parsed > 100) return undefined
    return parsed
  })()

  const [ state, setState ] = useState<StatsState | undefined>(undefined)
  const playerIdRef = useRef<string | null>(null)
  const latestMatchIdRef = useRef<string | null>(null)
  const isPollingRef = useRef(false)

  const mapStatsToState = (stats: StatsPayload): StatsState => ({
    country: stats.country,
    common: {
      level: stats.common.skillLevel,
      elo: stats.common.faceitElo,
      kdRatio: stats.common.kdRatio,
      rankLabel: stats.common.rankLabel,
    },
    daily: {
      wins: stats.daily.wins,
      losses: stats.daily.losses,
      averageKills: stats.daily.averageKills,
      averageAdr: stats.daily.averageAdr,
      kdRatio: stats.daily.kdRatio,
    },
    monthly: {
      winRate: stats.last30.winRate,
      averageKills: stats.last30.averageKills,
      averageAdr: stats.last30.averageAdr,
      kdRatio: stats.last30.kdRatio,
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

      const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search)
      if (hasNicknameWithoutEquals || nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true })
        return
      }

      if (!nicknameParam) {
        return
      }

      try {
        const stats: StatsPayload = await requestStats(nicknameParam, analyticsSource)

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
        const nextStats = await requestStats(nicknameParam, analyticsSource)
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
  }, [ backgroundOpacityParam, location.search, nicknameParam, rawNickname, searchParams, setSearchParams ])

  if (state === undefined) {
    return null
  }

  const levelValue = state.common.level
  const eloValue = state.common.elo

  const countryCode = (state.country || '').toLowerCase()
  const dailyAvgKillsAdr =
    `${formatNumberWithFixedDecimals(state.daily.averageKills, 0)} / ${formatNumberWithFixedDecimals(state.daily.averageAdr, 0)}`
  const monthlyAvgKillsAdr =
    `${formatNumberWithFixedDecimals(state.monthly.averageKills, 0)} / ${formatNumberWithFixedDecimals(state.monthly.averageAdr, 0)}`
  const monthlyKdKr = `${formatNumberWithFixedDecimals(state.monthly.kdRatio, 2)} / ${formatNumberWithFixedDecimals(state.monthly.krRatio, 2)}`

  const common = {
    levelValue,
    eloValue,
    kdRatioValue: state.common.kdRatio,
    countryCode,
    rankLabel: state.common.rankLabel,
  }

  const daily = {
    todayWins: state.daily.wins,
    todayLosses: state.daily.losses,
    avgKillsAdr: dailyAvgKillsAdr,
    kdRatioValue: state.daily.kdRatio,
  }

  const monthly = {
    winRateValue: `${state.monthly.winRate}%`,
    avgKillsAdr: monthlyAvgKillsAdr,
    kdKr: monthlyKdKr,
  }

  return (
    <div className='stats-page'>
      <StatsWidgetCard
        common={common}
        daily={daily}
        monthly={monthly}
        backgroundOpacityPercent={backgroundOpacityParam}
        className='stats-page__widget'
      />
    </div>
  )
}
