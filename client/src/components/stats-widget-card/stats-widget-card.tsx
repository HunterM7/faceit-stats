import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react'
import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon'
import { CountryFlagIcon } from '@components/country-flag-icon/country-flag-icon'
import { StatsWidgetCardMetric } from './stats-widget-card-metric/stats-widget-card-metric'
import { MatchResult, StatsWidgetCardMatchResults } from './stats-widget-card-match-results/stats-widget-card-match-results'
import { StatsWidgetCardValue } from './stats-widget-card-value/stats-widget-card-value'
import './stats-widget-card.scss'

interface CommonStatistic {
  /** Текущий уровень FACEIT (skill level). */
  levelValue: number;
  /** Текущее значение ELO игрока. */
  eloValue: number;
  /** Текущее значение K/D для верхнего блока. */
  kdRatioValue: number;
  /** Код страны игрока (ISO alpha-2), например `ru` или `ua`. */
  countryCode: string;
  /** Текстовый label ранга игрока (например, `#1234`). */
  rankLabel: string;
}

interface DailyStatistic {
  /** Количество побед за сегодня. */
  todayWins: number;
  /** Количество поражений за сегодня. */
  todayLosses: number;
  /** Средние kills/ADR за сегодня (подготовленная строка). */
  avgKillsAdr: string;
  /** Значение K/D за сегодня (подготовленная строка). */
  kdRatioValue: number;
}

interface MonthlyStatistic {
  /** Win rate за последние 30 матчей (подготовленная строка). */
  winRateValue: string;
  /** Средние kills/ADR за последние 30 матчей (подготовленная строка). */
  avgKillsAdr: string;
  /** Сводное значение K/D / K/R за последние 30 матчей (подготовленная строка). */
  kdKr: string;
}

type StatsWidgetCardProps = {
  /** Общая статистика игрока. */
  common: CommonStatistic;
  /** Статистика игрока за текущий игровой день. */
  daily: DailyStatistic;
  /** Статистика игрока за последние 30 матчей. */
  monthly: MonthlyStatistic;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
  /** Прозрачность фона карточки в процентах (0-100). */
  backgroundOpacityPercent?: number | undefined;
}

export function StatsWidgetCard(props: StatsWidgetCardProps) {
  const { common, daily, monthly, className, backgroundOpacityPercent = 96 } = props
  const normalizedOpacity = Math.min(100, Math.max(0, backgroundOpacityPercent)) / 100
  const cardStyle = {
    '--stats-widget-card-bg-opacity': normalizedOpacity,
  } as CSSProperties

  // Для показа определенной панели
  // const panel: 'last30' | 'today' = 'today'
  // const isPanelVisible = true

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
    <div className={classNames('stats-widget-card', className)} style={cardStyle}>
      <div className='stats-widget-card__top'>
        <div className='stats-widget-card__level-badge'>
          <SkillLevelIcon level={common.levelValue} className='stats-widget-card__level-icon'/>
          <StatsWidgetCardValue label='ELO'>
            {common.eloValue}
          </StatsWidgetCardValue>
        </div>

        <StatsWidgetCardValue label='K/D' className='stats-widget-card__kd'>
          {formatNumberWithFixedDecimals(common.kdRatioValue, 2)}
        </StatsWidgetCardValue>

        <StatsWidgetCardValue label='RANK' className='stats-widget-card__rank'>
          <CountryFlagIcon countryCode={common.countryCode} className='stats-widget-card__country-flag-icon'/>
          <span>{common.rankLabel}</span>
        </StatsWidgetCardValue>
      </div>

      <div className='stats-widget-card__divider'/>

      <div className='stats-widget-card__panels'>
        <div className={`stats-widget-card__panel stats-widget-card__panel--last30 ${getPanelStateClass('last30')}`}>
          <div className='stats-widget-card__subtitle'>LAST 30 MATCHES</div>
          <div className='stats-widget-card__grid'>
            <StatsWidgetCardMetric value={monthly.winRateValue} label='Win rate'/>
            <StatsWidgetCardMetric value={monthly.avgKillsAdr} label='Avg. Kills / ADR'/>
            <StatsWidgetCardMetric value={monthly.kdKr} label='K/D / K/R'/>
          </div>
        </div>

        <div className={`stats-widget-card__panel stats-widget-card__panel--today ${getPanelStateClass('today')}`}>
          <div className='stats-widget-card__subtitle'>STATS TODAY</div>
          <div className='stats-widget-card__grid'>
            <div className='stats-widget-card__match-results'>
              <StatsWidgetCardMatchResults value={daily.todayWins} result={MatchResult.Win}/>
              <StatsWidgetCardMatchResults value={daily.todayLosses} result={MatchResult.Lose}/>
            </div>
            <StatsWidgetCardMetric value={daily.avgKillsAdr} label='Avg. Kills / ADR' className='stats-widget-card__metric'/>
            <StatsWidgetCardMetric value={formatNumberWithFixedDecimals(daily.kdRatioValue, 2)} label='K/D' className='stats-widget-card__metric'/>
          </div>
        </div>
      </div>
    </div>
  )
}
