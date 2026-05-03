import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon'
import { CountryFlagIcon } from '@components/country-flag-icon/country-flag-icon'
import { RegionFlagIcon } from '@components/region-flag-icon/region-flag-icon'
import { WidgetStatisticsLast30WinRate } from './widget-statistics-last30-win-rate/widget-statistics-last30-win-rate'
import { WidgetStatisticsMetric } from './widget-statistics-metric/widget-statistics-metric'
import { MatchResult, WidgetStatisticsMatchResults } from './widget-statistics-match-results/widget-statistics-match-results'
import { WidgetStatisticsValue } from './widget-statistics-value/widget-statistics-value'
import type { Rank } from '@requests/stats'
import './widget-statistics.scss'

const CARD_SWITCH_MS = 5000
const CARD_FADE_MS = 700

interface CommonStatistic {
  /** Текущий уровень FACEIT игрока. */
  level: number;
  /** Текущее значение ELO игрока. */
  elo: number;
  /** Текущее значение K/D игрока. */
  kd: number;
  /** Ранг игрока. */
  rank: Rank;
}

interface DailyStatistic {
  /** Количество побед за сегодня. */
  todayWins: number;
  /** Количество поражений за сегодня. */
  todayLosses: number;
  /** Средние kills/ADR за сегодня (подготовленная строка). */
  avgKillsAdr: string;
  /** Значение K/D за сегодня (подготовленная строка). */
  kd: number;
}

interface MonthlyStatistic {
  /** Win rate за последние 30 матчей, 0–100. */
  winRatePercent: number;
  /** Победы по времени для графика: `true` — победа (слева старые матчи). */
  last30MatchResults: boolean[];
  /** Средние kills/ADR за последние 30 матчей (подготовленная строка). */
  avgKillsAdr: string;
  /** Сводное значение K/D / K/R за последние 30 матчей (подготовленная строка). */
  kdKr: string;
}

type WidgetStatisticsProps = {
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
  /** Скругление углов карточки в px (0-18). */
  borderRadius?: number | undefined;
}

export function WidgetStatistics(props: WidgetStatisticsProps) {
  const { common, daily, monthly, className, backgroundOpacityPercent = 96, borderRadius = 16 } = props
  const normalizedOpacity = Math.min(100, Math.max(0, backgroundOpacityPercent)) / 100
  const normalizedBorderRadiusPx = Math.min(18, Math.max(0, Math.round(borderRadius)))
  const cardStyle = {
    '--widget-statistics-bg-opacity': normalizedOpacity,
    '--widget-statistics-radius': `${normalizedBorderRadiusPx}px`,
  } as CSSProperties

  const rk = common.rank
  const hasCountry = Boolean(rk.country)
  const hasRegion = Boolean(rk.region)
  const hasBoth = hasCountry && hasRegion

  const [ rankView, setRankView ] = useState<'country' | 'region'>('country')
  const [ rankVisible, setRankVisible ] = useState(true)

  const getRankSlideClass = (target: 'country' | 'region') => {
    if (!hasBoth) {
      const isActiveSingle =
        (hasCountry && target === 'country') || (hasRegion && target === 'region')
      return isActiveSingle
        ? 'widget-statistics__rank-slide--active'
        : 'widget-statistics__rank-slide--hidden'
    }
    if (rankView !== target) return 'widget-statistics__rank-slide--hidden'
    return rankVisible ? 'widget-statistics__rank-slide--active' : 'widget-statistics__rank-slide--hiding'
  }

  const renderCountrySlide = (slideClass: string) => (
    <div className={classNames('widget-statistics__rank-slide', slideClass)} aria-hidden={hasBoth ? rankView !== 'country' : undefined}>
      <div className='widget-statistics__rank-row'>
        <CountryFlagIcon countryCode={rk.country!.code} className='widget-statistics__country-flag-icon'/>
        <span>#{rk.country!.rating}</span>
      </div>
    </div>
  )

  const renderRegionSlide = (slideClass: string) => (
    <div className={classNames('widget-statistics__rank-slide', slideClass)} aria-hidden={hasBoth ? rankView !== 'region' : undefined}>
      <div className='widget-statistics__rank-row widget-statistics__rank-row--region'>
        <RegionFlagIcon regionCode={rk.region!.code} className='widget-statistics__region-flag-icon'/>
        <span>#{rk.region!.rating}</span>
      </div>
    </div>
  )

  // Для показа определенной панели
  // const panel: 'last30' | 'today' = 'today'
  // const isPanelVisible = true

  const [ panel, setPanel ] = useState<'last30' | 'today'>('last30')
  const [ isPanelVisible, setIsPanelVisible ] = useState(true)

  useEffect(() => {
    let fadeTimer: number | null = null
    const panelTimer = window.setInterval(() => {
      setIsPanelVisible(false)
      if (hasBoth) {
        setRankVisible(false)
      }
      fadeTimer = window.setTimeout(() => {
        fadeTimer = null
        setPanel((prev) => (prev === 'last30' ? 'today' : 'last30'))
        setIsPanelVisible(true)
        if (hasBoth) {
          setRankView((prev) => (prev === 'country' ? 'region' : 'country'))
          setRankVisible(true)
        }
      }, CARD_FADE_MS)
    }, CARD_SWITCH_MS)

    return () => {
      window.clearInterval(panelTimer)
      if (fadeTimer !== null) window.clearTimeout(fadeTimer)
    }
  }, [ hasBoth ])

  const getPanelStateClass = (target: 'last30' | 'today') => {
    if (panel !== target) return 'widget-statistics__panel--hidden'
    return isPanelVisible ? 'widget-statistics__panel--active' : 'widget-statistics__panel--hiding'
  }

  return (
    <div className={classNames('widget-statistics', className)} style={cardStyle}>
      <div className='widget-statistics__top'>
        <div className='widget-statistics__level-badge'>
          <SkillLevelIcon level={common.level} className='widget-statistics__level-icon'/>
          <WidgetStatisticsValue label='ELO'>
            {common.elo}
          </WidgetStatisticsValue>
        </div>

        <WidgetStatisticsValue label='K/D' className='widget-statistics__kd'>
          {formatNumberWithFixedDecimals(common.kd, 2)}
        </WidgetStatisticsValue>

        <WidgetStatisticsValue label='RANK' className='widget-statistics__rank'>
          <div className='widget-statistics__rank-slots'>
            {hasBoth && (
              <>
                {renderCountrySlide(getRankSlideClass('country'))}
                {renderRegionSlide(getRankSlideClass('region'))}
              </>
            )}
            {hasCountry && !hasRegion && renderCountrySlide('widget-statistics__rank-slide--active')}
            {hasRegion && !hasCountry && renderRegionSlide('widget-statistics__rank-slide--active')}
          </div>
        </WidgetStatisticsValue>
      </div>

      <div className='widget-statistics__divider'/>

      <div className='widget-statistics__panels'>
        <div className={`widget-statistics__panel widget-statistics__panel--last30 ${getPanelStateClass('last30')}`}>
          <div className='widget-statistics__subtitle'>LAST 30 MATCHES</div>
          <div className='widget-statistics__grid'>
            <WidgetStatisticsLast30WinRate
              winRatePercent={monthly.winRatePercent}
              matchResults={monthly.last30MatchResults}
              className='widget-statistics__metric'
            />
            <WidgetStatisticsMetric value={monthly.avgKillsAdr} label='Avg. Kills / ADR' className='widget-statistics__metric'/>
            <WidgetStatisticsMetric value={monthly.kdKr} label='K/D / K/R' className='widget-statistics__metric'/>
          </div>
        </div>

        <div className={`widget-statistics__panel widget-statistics__panel--today ${getPanelStateClass('today')}`}>
          <div className='widget-statistics__subtitle'>STATS TODAY</div>
          <div className='widget-statistics__grid'>
            <div className='widget-statistics__match-results'>
              <WidgetStatisticsMatchResults value={daily.todayWins} result={MatchResult.Win}/>
              <WidgetStatisticsMatchResults value={daily.todayLosses} result={MatchResult.Lose}/>
            </div>
            <WidgetStatisticsMetric value={daily.avgKillsAdr} label='Avg. Kills / ADR' className='widget-statistics__metric'/>
            <WidgetStatisticsMetric value={formatNumberWithFixedDecimals(daily.kd, 2)} label='K/D' className='widget-statistics__metric'/>
          </div>
        </div>
      </div>
    </div>
  )
}
