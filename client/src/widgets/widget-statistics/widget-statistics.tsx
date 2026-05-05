import type { ComponentProps, CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon'
import { CountryFlagIcon } from '@components/country-flag-icon/country-flag-icon'
import { RegionFlagIcon } from '@components/region-flag-icon/region-flag-icon'
import { WidgetStatisticsDailyPanel } from './widget-statistics-daily-panel/widget-statistics-daily-panel'
import { WidgetStatisticsRecentMatchesPanel } from './widget-statistics-recent-matches-panel/widget-statistics-recent-matches-panel'
import { WidgetStatisticsValue } from './widget-statistics-value/widget-statistics-value'
import type { Rank } from '@requests/stats'
import './widget-statistics.scss'

const CARD_SWITCH_MS = 5000
const CARD_FADE_MS = 700

interface WidgetStatisticsProps {
  /** Общая статистика игрока. */
  common: {
    /** Текущий уровень FACEIT игрока. */
    level: number;
    /** Текущее значение ELO игрока. */
    elo: number;
    /** Текущее значение K/D игрока. */
    kd: number;
    /** Ранг игрока. */
    rank: Rank;
  };
  /** Статистика игрока за текущий игровой день. */
  daily: ComponentProps<typeof WidgetStatisticsDailyPanel>['data'];
  /** Статистика игрока за последние 30 матчей. */
  recentMatches: ComponentProps<typeof WidgetStatisticsRecentMatchesPanel>['data'];
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
  /** Прозрачность фона карточки в процентах (0-100). */
  backgroundOpacity?: number | undefined;
  /** Скругление углов карточки в px (0-18). */
  borderRadius?: number | undefined;
}

export function WidgetStatistics(props: WidgetStatisticsProps) {
  const { common, daily, recentMatches, className, backgroundOpacity = 96, borderRadius = 16 } = props
  const normalizedOpacity = Math.min(100, Math.max(0, backgroundOpacity)) / 100
  const normalizedBorderRadiusPx = Math.min(18, Math.max(0, Math.round(borderRadius)))
  const cardStyle = {
    '--widget-statistics-bg-opacity': normalizedOpacity,
    '--widget-statistics-radius': `${normalizedBorderRadiusPx}px`,
  } as CSSProperties

  const hasCountry = Boolean(common.rank.country)
  const hasRegion = Boolean(common.rank.region)
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
        <CountryFlagIcon countryCode={common.rank.country!.code} className='widget-statistics__country-flag-icon'/>
        <span>#{common.rank.country!.rating}</span>
      </div>
    </div>
  )

  const renderRegionSlide = (slideClass: string) => (
    <div className={classNames('widget-statistics__rank-slide', slideClass)} aria-hidden={hasBoth ? rankView !== 'region' : undefined}>
      <div className='widget-statistics__rank-row widget-statistics__rank-row--region'>
        <RegionFlagIcon regionCode={common.rank.region!.code} className='widget-statistics__region-flag-icon'/>
        <span>#{common.rank.region!.rating}</span>
      </div>
    </div>
  )

  // Для показа определенной панели
  // const panel: 'today' | 'recentMatches' = 'today'
  // const isPanelVisible = true

  const [ panel, setPanel ] = useState<'today' | 'recentMatches'>('today')
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
        setPanel((prev) => (prev === 'recentMatches' ? 'today' : 'recentMatches'))
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

  const getPanelStateClass = (target: 'recentMatches' | 'today') => {
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
        <WidgetStatisticsDailyPanel data={daily} className={classNames('widget-statistics__panel', getPanelStateClass('today'))}/>
        <WidgetStatisticsRecentMatchesPanel data={recentMatches} className={classNames('widget-statistics__panel', getPanelStateClass('recentMatches'))}/>
      </div>
    </div>
  )
}
