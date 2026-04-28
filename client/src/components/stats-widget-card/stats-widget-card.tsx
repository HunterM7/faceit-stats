import { useEffect, useState } from 'react'
import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon'
import { StatsWidgetCardMetric } from './stats-widget-card-metric/stats-widget-card-metric'
import './stats-widget-card.scss'

interface CommonStatistic {
  /** Текущий уровень FACEIT (skill level). */
  levelValue: number
  /** Текущее значение ELO игрока. */
  eloValue: number
  /** Текущее значение K/D для верхнего блока. */
  kdRatioValue: number
  /** Emoji-флаг страны игрока (может быть пустым). */
  countryFlag: string
  /** Текстовый label ранга игрока (например, `#1234`). */
  rankLabel: string
}

interface DailyStatistic {
  /** Количество побед за сегодня. */
  todayWins: number
  /** Количество поражений за сегодня. */
  todayLosses: number
  /** Средние kills/ADR за сегодня (подготовленная строка). */
  avgKillsAdr: string
  /** Значение K/D за сегодня (подготовленная строка). */
  kdRatioValue: number
}

interface MonthlyStatistic {
  /** Win rate за последние 30 матчей (подготовленная строка). */
  winRateValue: string
  /** Средние kills/ADR за последние 30 матчей (подготовленная строка). */
  avgKillsAdr: string
  /** Сводное значение K/D / K/R за последние 30 матчей (подготовленная строка). */
  kdKr: string
}

type StatsWidgetCardProps = {
  /** Общая статистика игрока. */
  common: CommonStatistic
  /** Статистика игрока за текущий игровой день. */
  daily: DailyStatistic
  /** Статистика игрока за последние 30 матчей. */
  monthly: MonthlyStatistic
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined
}

export function StatsWidgetCard(props: StatsWidgetCardProps) {
  const { common, daily, monthly, className } = props

  const PANEL_SWITCH_MS = 5000
  const PANEL_FADE_MS = 700

  const [ panel, setPanel ] = useState<'last30' | 'today'>('last30')
  const [ isPanelVisible, setIsPanelVisible ] = useState(true)

  useEffect(() => {
    let fadeTimer: number | null = null
    const panelTimer = window.setInterval(() => {
      setIsPanelVisible(false)
      fadeTimer = window.setTimeout(() => {
        setPanel((prev) => (prev === 'last30' ? 'today' : 'last30'))
        setIsPanelVisible(true)
      }, PANEL_FADE_MS)
    }, PANEL_SWITCH_MS)

    return () => {
      window.clearInterval(panelTimer)
      if (fadeTimer) window.clearTimeout(fadeTimer)
    }
  }, [])

  const getPanelStateClass = (target: 'last30' | 'today') => {
    if (panel !== target) return 'stats-widget-card__panel--hidden'
    return isPanelVisible ? 'stats-widget-card__panel--active' : 'stats-widget-card__panel--hiding'
  }

  return (
    <div className={classNames('stats-widget-card', className)}>
      <div className='stats-widget-card__top'>
        <div className='stats-widget-card__level-badge'>
          <SkillLevelIcon level={common.levelValue} className='stats-widget-card__level-icon'/>
          <span className='stats-widget-card__elo'>
            {common.eloValue}
            <div className='stats-widget-card__label'>ELO</div>
          </span>
        </div>

        <div className='stats-widget-card__kd-ratio'>
          {common.kdRatioValue}
          <div className='stats-widget-card__label'>K/D RATIO</div>
        </div>

        <div className='stats-widget-card__rank'>
          <span>{common.countryFlag.toLocaleUpperCase()}</span>
          <span>{common.rankLabel}</span>
          <div className='stats-widget-card__label'>RANK</div>
        </div>
      </div>

      <div className='stats-widget-card__divider' />

      <div className='stats-widget-card__panels'>
        <div className={`stats-widget-card__panel stats-widget-card__panel--last30 ${getPanelStateClass('last30')}`}>
          <div className='stats-widget-card__subtitle'>LAST 30 MATCHES</div>
          <div className='stats-widget-card__grid'>
            <StatsWidgetCardMetric value={monthly.winRateValue} label='Win rate' />
            <StatsWidgetCardMetric value={monthly.avgKillsAdr} label='Avg. Kills / ADR' />
            <StatsWidgetCardMetric value={monthly.kdKr} label='K/D / K/R' />
          </div>
        </div>

        <div className={`stats-widget-card__panel stats-widget-card__panel--today ${getPanelStateClass('today')}`}>
          <div className='stats-widget-card__subtitle'>STATS TODAY</div>
          <div className='stats-widget-card__grid stats-widget-card__grid--today'>
            <StatsWidgetCardMetric value={daily.todayWins} label='Wins' valueClassName='stats-widget-card-metric__value--win' />
            <StatsWidgetCardMetric value={daily.todayLosses} label='Losses' valueClassName='stats-widget-card-metric__value--loss' />
            <StatsWidgetCardMetric value={daily.avgKillsAdr} label='Avg. Kills / ADR' />
            <StatsWidgetCardMetric value={formatNumberWithFixedDecimals(daily.kdRatioValue, 2)} label='K/D' />
          </div>
        </div>
      </div>
    </div>
  )
}
