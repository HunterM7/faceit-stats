import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { StatsWidgetCard } from '@components/stats-widget-card/stats-widget-card'
import { requestStats, type StatsPayload } from '@requests/stats'
import './stats-page.scss'
import { formatNumberWithFixedDecimals } from '@/utils/number-format';

type StatsState = {
  nickname: string
  country: string | null
  elo: number
  level: number
  rankLabel: string
  winRate: number | null
  averageKills: number | null
  averageAdr: number | null
  kdRatio: number | null
  krRatio: number | null
  last30Wins: number
  last30Losses: number
  todayWins: number
  todayLosses: number
  updated: string
  status: 'online' | 'offline'
  latestResult: 'WIN' | 'LOSS' | 'UNKNOWN'
}

function formatUpdated(iso?: string | null): string {
  if (!iso) return '--:--:--'
  return new Date(iso).toLocaleTimeString()
}

function countryCodeToFlagEmoji(code?: string | null): string {
  if (!code) return ''
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return ''
  return String.fromCodePoint(...normalized.split('').map((char) => 127397 + char.charCodeAt(0)))
}

export function StatsPage() {
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const rawNickname = searchParams.get('nickname')
  const nicknameParam = rawNickname?.trim()

  const [ state, setState ] = useState<StatsState | undefined>(undefined)

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      const nextParams = new URLSearchParams()
      nextParams.set('nickname', rawNickname ?? '')

      const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search)
      if (hasNicknameWithoutEquals || nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true })
        return
      }

      if (!nicknameParam) {
        return
      }

      try {
        const payload = (await requestStats(nicknameParam)) as StatsPayload

        const stats = payload

        if (!mounted || !stats) {
          return
        }

        setState({
          nickname: stats.nickname || 'Unknown',
          country: stats.country || null,
          elo: typeof stats.faceitElo === 'number' ? stats.faceitElo : null,
          level: typeof stats.skillLevel === 'number' ? stats.skillLevel : null,
          rankLabel: stats.faceitElo ? `#${Math.max(1, Math.round(5000 - stats.faceitElo)).toString()}` : '#----',
          winRate: typeof stats.winRate === 'number' ? stats.winRate : null,
          averageKills: typeof stats.averageKills === 'number' ? stats.averageKills : null,
          averageAdr: typeof stats.averageAdr === 'number' ? stats.averageAdr : null,
          kdRatio: stats.kdRatio,
          krRatio: typeof stats.krRatio === 'number' ? stats.krRatio : null,
          last30Wins: stats.last30Wins ?? 0,
          last30Losses: stats.last30Losses ?? 0,
          todayWins: stats.todayWins ?? 0,
          todayLosses: stats.todayLosses ?? 0,
          updated: formatUpdated(stats.updatedAt),
          status: 'online',
          latestResult: stats.latestMatchResult || 'UNKNOWN',
        })
      } catch {
        if (!mounted) return
        // Keep the last successful state on transient fetch errors.
      }
    }

    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [ location.search, nicknameParam, rawNickname, searchParams, setSearchParams ])

  if (state === undefined) {
    return null
  }

  const levelValue = state.level ?? 0
  const eloValue = state.elo ?? 0
  const wins30 = state.last30Wins
  const losses30 = state.last30Losses
  const total30 = wins30 + losses30
  const winRate30 = total30 > 0 ? Math.round((wins30 / total30) * 100) : null

  const countryFlag = countryCodeToFlagEmoji(state.country)
  const winRateValue = winRate30 === null ? '--' : `${winRate30}%`
  const avgKillsAdr = `${formatNumberWithFixedDecimals(state.averageKills, 0)} / ${formatNumberWithFixedDecimals(state.averageAdr, 0)}`
  const kdKr = `${formatNumberWithFixedDecimals(state.averageKills, 2)} / ${formatNumberWithFixedDecimals(state.krRatio, 2)}`

  const common = {
    levelValue,
    eloValue,
    kdRatioValue: state.kdRatio,
    countryFlag,
    rankLabel: state.rankLabel,
  }

  const daily = {
    todayWins: state.todayWins,
    todayLosses: state.todayLosses,
    avgKillsAdr,
    kdRatioValue: state.kdRatio,
  }

  const monthly = {
    winRateValue,
    avgKillsAdr,
    kdKr,
  }

  return (
    <div className='stats-page'>
      <StatsWidgetCard
        common={common}
        daily={daily}
        monthly={monthly}
        className='stats-page__widget'
      />
    </div>
  )
}
