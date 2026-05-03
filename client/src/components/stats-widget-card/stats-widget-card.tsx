import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon'
import { CountryFlagIcon } from '@components/country-flag-icon/country-flag-icon'
import { RegionFlagIcon } from '@components/region-flag-icon/region-flag-icon'
import { StatsWidgetCardLast30WinRate } from './stats-widget-card-last30-win-rate/stats-widget-card-last30-win-rate'
import { StatsWidgetCardMetric } from './stats-widget-card-metric/stats-widget-card-metric'
import { MatchResult, StatsWidgetCardMatchResults } from './stats-widget-card-match-results/stats-widget-card-match-results'
import { StatsWidgetCardValue } from './stats-widget-card-value/stats-widget-card-value'
import type { StatsRankBlock } from '@requests/stats'
import './stats-widget-card.scss'

const CARD_SWITCH_MS = 5000
const CARD_FADE_MS = 700

interface CommonStatistic {
  /** Текущий уровень FACEIT (skill level). */
  levelValue: number;
  /** Текущее значение ELO игрока. */
  eloValue: number;
  /** Текущее значение K/D для верхнего блока. */
  kdRatioValue: number;
  /** Код страны игрока (ISO alpha-2), например `ru` или `ua`. */
  countryCode: string;
  /** Лидерборд: регион и/или страна с позицией из FACEIT Rankings API. */
  rank: StatsRankBlock;
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
  /** Win rate за последние 30 матчей, 0–100. */
  winRatePercent: number;
  /** Победы по времени для графика: `true` — победа (слева старые матчи). */
  last30MatchResults: boolean[];
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
  /** Скругление углов карточки в px (0-18). */
  borderRadius?: number | undefined;
}

export function StatsWidgetCard(props: StatsWidgetCardProps) {
  const { common, daily, monthly, className, backgroundOpacityPercent = 96, borderRadius = 16 } = props
  const normalizedOpacity = Math.min(100, Math.max(0, backgroundOpacityPercent)) / 100
  const normalizedBorderRadiusPx = Math.min(18, Math.max(0, Math.round(borderRadius)))
  const cardStyle = {
    '--stats-widget-card-bg-opacity': normalizedOpacity,
    '--stats-widget-card-radius': `${normalizedBorderRadiusPx}px`,
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
        ? 'stats-widget-card__rank-slide--active'
        : 'stats-widget-card__rank-slide--hidden'
    }
    if (rankView !== target) return 'stats-widget-card__rank-slide--hidden'
    return rankVisible ? 'stats-widget-card__rank-slide--active' : 'stats-widget-card__rank-slide--hiding'
  }

  const renderRankPlaceholder = () => (
    <div className='stats-widget-card__rank-row'>
      <CountryFlagIcon countryCode={common.countryCode} className='stats-widget-card__country-flag-icon'/>
      <span>#----</span>
    </div>
  )

  const renderCountrySlide = (slideClass: string) => (
    <div className={classNames('stats-widget-card__rank-slide', slideClass)} aria-hidden={hasBoth ? rankView !== 'country' : undefined}>
      <div className='stats-widget-card__rank-row'>
        <CountryFlagIcon countryCode={common.countryCode} className='stats-widget-card__country-flag-icon'/>
        <span>#{rk.country!.rating}</span>
      </div>
    </div>
  )

  const renderRegionSlide = (slideClass: string) => (
    <div className={classNames('stats-widget-card__rank-slide', slideClass)} aria-hidden={hasBoth ? rankView !== 'region' : undefined}>
      <div className='stats-widget-card__rank-row stats-widget-card__rank-row--region'>
        <RegionFlagIcon regionCode={rk.region!.code} className='stats-widget-card__region-flag-icon'/>
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
          <div className='stats-widget-card__rank-slots'>
            {!hasCountry && !hasRegion ? renderRankPlaceholder() : null}
            {hasBoth ? (
              <>
                {renderCountrySlide(getRankSlideClass('country'))}
                {renderRegionSlide(getRankSlideClass('region'))}
              </>
            ) : null}
            {hasCountry && !hasRegion ? renderCountrySlide('stats-widget-card__rank-slide--active') : null}
            {hasRegion && !hasCountry ? renderRegionSlide('stats-widget-card__rank-slide--active') : null}
          </div>
        </StatsWidgetCardValue>
      </div>

      <div className='stats-widget-card__divider'/>

      <div className='stats-widget-card__panels'>
        <div className={`stats-widget-card__panel stats-widget-card__panel--last30 ${getPanelStateClass('last30')}`}>
          <div className='stats-widget-card__subtitle'>LAST 30 MATCHES</div>
          <div className='stats-widget-card__grid'>
            <StatsWidgetCardLast30WinRate
              winRatePercent={monthly.winRatePercent}
              matchResults={monthly.last30MatchResults}
              className='stats-widget-card__metric'
            />
            <StatsWidgetCardMetric value={monthly.avgKillsAdr} label='Avg. Kills / ADR' className='stats-widget-card__metric'/>
            <StatsWidgetCardMetric value={monthly.kdKr} label='K/D / K/R' className='stats-widget-card__metric'/>
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
