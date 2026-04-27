import { useEffect, useState, type ReactNode } from 'react'
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon'
import { requestStats, type StatsPayload } from '@requests/stats'
import './stats-page.scss'

type StatsState = {
  nickname: string
  country: string | null
  elo: number | null
  level: number | null
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
  errorMessage: string | null
}

type StatsMetricProps = {
  value: ReactNode
  label: string
  valueClassName?: string
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

function StatsMetric({ value, label, valueClassName }: StatsMetricProps) {
  return (
    <div className="stats-widget__metric">
      <div className={valueClassName ? `stats-widget__value ${valueClassName}` : 'stats-widget__value'}>{value}</div>
      <div className="stats-widget__label">{label}</div>
    </div>
  )
}

export function StatsPage() {
  const PANEL_SWITCH_MS = 5000
  const PANEL_FADE_MS = 700

  const params = new URLSearchParams(window.location.search)
  const nicknameParam = params.get('nickname')?.trim()
  const hideRank = params.get('hideRank') === 'true'
  const hideChallenger = params.get('hideChallenger') === 'true'
  const transparent = params.get('transparent') !== 'false'

  const [ state, setState ] = useState<StatsState>({
    nickname: '...',
    country: null,
    elo: null,
    level: null,
    rankLabel: '#----',
    winRate: null,
    averageKills: null,
    averageAdr: null,
    kdRatio: null,
    krRatio: null,
    last30Wins: 0,
    last30Losses: 0,
    todayWins: 0,
    todayLosses: 0,
    updated: '--:--:--',
    status: 'offline',
    latestResult: 'UNKNOWN',
    errorMessage: null,
  })
  const [ panel, setPanel ] = useState<'last30' | 'today'>('last30')
  const [ isPanelVisible, setIsPanelVisible ] = useState(true)

  useEffect(() => {
    let mounted = true

    const refresh = async () => {
      if (!nicknameParam) {
        if (!mounted) return
        setState((prev) => ({
          ...prev,
          status: 'offline',
          updated: 'offline',
          latestResult: 'UNKNOWN',
          errorMessage: 'Не передан nickname в URL. Добавь параметр ?nickname=FACEIT_NICK',
        }))
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
          kdRatio: typeof stats.kdRatio === 'number' ? stats.kdRatio : null,
          krRatio: typeof stats.krRatio === 'number' ? stats.krRatio : null,
          last30Wins: stats.last30Wins ?? 0,
          last30Losses: stats.last30Losses ?? 0,
          todayWins: stats.todayWins ?? 0,
          todayLosses: stats.todayLosses ?? 0,
          updated: formatUpdated(stats.updatedAt),
          status: 'online',
          latestResult: stats.latestMatchResult || 'UNKNOWN',
          errorMessage: null,
        })
      } catch (error) {
        if (!mounted) return
        setState((prev) => ({
          ...prev,
          status: 'offline',
          updated: 'offline',
          latestResult: 'UNKNOWN',
          errorMessage: error instanceof Error ? error.message : 'Не удалось загрузить статистику',
        }))
      }
    }

    refresh()
    const timer = window.setInterval(refresh, 60000)
    let fadeTimer: number | null = null
    const panelTimer = window.setInterval(() => {
      setIsPanelVisible(false)
      fadeTimer = window.setTimeout(() => {
        setPanel((prev) => (prev === 'last30' ? 'today' : 'last30'))
        setIsPanelVisible(true)
      }, PANEL_FADE_MS)
    }, PANEL_SWITCH_MS)
    return () => {
      mounted = false
      window.clearInterval(timer)
      window.clearInterval(panelTimer)
      if (fadeTimer) window.clearTimeout(fadeTimer)
    }
  }, [ nicknameParam ])

  const getPanelStateClass = (target: 'last30' | 'today') => {
    if (panel !== target) return 'stats-widget__panel--hidden'
    return isPanelVisible ? 'stats-widget__panel--active' : 'stats-widget__panel--hiding'
  }

  const levelValue = state.level ?? 0
  const eloValue = state.elo ?? 0
  const wins30 = state.last30Wins
  const losses30 = state.last30Losses
  const total30 = wins30 + losses30
  const winRate30 = total30 > 0 ? Math.round((wins30 / total30) * 100) : null

  const formatOne = (value: number | null): string => (typeof value === 'number' ? value.toFixed(1) : '--')
  const formatZero = (value: number | null): string => (typeof value === 'number' ? Math.round(value).toString() : '--')
  const countryFlag = countryCodeToFlagEmoji(state.country)
  const winRateValue = winRate30 === null ? '--' : `${winRate30}%`
  const avgKillsAdr = `${formatOne(state.averageKills)} / ${formatZero(state.averageAdr)}`
  const kdKr = `${formatOne(state.kdRatio)} / ${formatOne(state.krRatio)}`

  return (
    <div className={`stats-widget ${transparent ? 'stats-widget--transparent' : 'stats-widget--solid'}`}>
      <div className="stats-widget__card">
        <div className="stats-widget__top">
          {state.errorMessage ? <div className="stats-widget__top-label">{state.errorMessage}</div> : null}
          {!hideRank && (
            <div className="stats-widget__level-badge">
              {levelValue ? (
                <SkillLevelIcon level={levelValue} className="stats-widget__level-icon" />
              ) : (
                <span>{levelValue || '-'}</span>
              )}
            </div>
          )}
          <div className="stats-widget__top-item">
            <div className="stats-widget__top-value">{eloValue || '--'}</div>
            <div className="stats-widget__top-label">ELO</div>
          </div>
          <div className="stats-widget__top-item">
            <div className="stats-widget__top-value">{formatOne(state.kdRatio)}</div>
            <div className="stats-widget__top-label">K/D RATIO</div>
          </div>
          {!hideChallenger && (
            <div className="stats-widget__top-item stats-widget__top-item--rank">
              <div className="stats-widget__top-value">
                {countryFlag ? <span className="stats-widget__country-flag">{countryFlag}</span> : null}
                <span>{state.rankLabel}</span>
              </div>
              <div className="stats-widget__top-label">RANK</div>
            </div>
          )}
        </div>

        <div className="stats-widget__divider" />

        <div className="stats-widget__panels">
          <div className={`stats-widget__panel stats-widget__panel--last30 ${getPanelStateClass('last30')}`}>
            <div className="stats-widget__subtitle">LAST 30 MATCHES</div>
            <div className="stats-widget__grid">
              <StatsMetric value={winRateValue} label="Win rate" />
              <StatsMetric value={avgKillsAdr} label="Avg. Kills / ADR" />
              <StatsMetric value={kdKr} label="K/D / K/R" />
            </div>
          </div>

          <div className={`stats-widget__panel stats-widget__panel--today ${getPanelStateClass('today')}`}>
            <div className="stats-widget__subtitle">STATS TODAY</div>
            <div className="stats-widget__grid stats-widget__grid--today">
              <StatsMetric value={state.todayWins} label="Wins" valueClassName="stats-widget__value--win" />
              <StatsMetric value={state.todayLosses} label="Losses" valueClassName="stats-widget__value--loss" />
              <StatsMetric value={avgKillsAdr} label="Avg. Kills / ADR" />
              <StatsMetric value={formatOne(state.kdRatio)} label="K/D" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
