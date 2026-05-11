import type { ComponentProps, CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { WidgetStatisticsCommonPanel } from './widget-statistics-common-panel/widget-statistics-common-panel';
import { WidgetStatisticsDailyPanel } from './widget-statistics-daily-panel/widget-statistics-daily-panel';
import { WidgetStatisticsRecentMatchesPanel } from './widget-statistics-recent-matches-panel/widget-statistics-recent-matches-panel';
import './widget-statistics.scss';

const CARD_SWITCH_MS = 5000;
const CARD_FADE_MS = 700;

interface WidgetStatisticsProps {
  /** Общая статистика игрока. */
  common: ComponentProps<typeof WidgetStatisticsCommonPanel>['data'];
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
  const { common, daily, recentMatches, className, backgroundOpacity = 96, borderRadius = 16 } = props;
  const normalizedOpacity = Math.min(100, Math.max(0, backgroundOpacity)) / 100;
  const normalizedBorderRadiusPx = Math.min(18, Math.max(0, Math.round(borderRadius)));
  const cardStyle = {
    '--widget-statistics-bg-opacity': normalizedOpacity,
    '--widget-statistics-radius': `${normalizedBorderRadiusPx}px`,
  } as CSSProperties;

  const hasCountry = Boolean(common.rank.country);
  const hasRegion = Boolean(common.rank.region);
  const hasBoth = hasCountry && hasRegion;

  const [ rankView, setRankView ] = useState<'country' | 'region'>('country');
  const [ rankVisible, setRankVisible ] = useState(true);

  // Для показа определенной панели
  // const panel: 'today' | 'recentMatches' = 'today'
  // const isPanelVisible = true

  const [ panel, setPanel ] = useState<'today' | 'recentMatches'>('today');
  const [ isPanelVisible, setIsPanelVisible ] = useState(true);

  useEffect(() => {
    let fadeTimer: number | null = null;
    const panelTimer = window.setInterval(() => {
      setIsPanelVisible(false);
      if (hasBoth) {
        setRankVisible(false);
      }
      fadeTimer = window.setTimeout(() => {
        fadeTimer = null;
        setPanel((prev) => (prev === 'recentMatches' ? 'today' : 'recentMatches'));
        setIsPanelVisible(true);
        if (hasBoth) {
          setRankView((prev) => (prev === 'country' ? 'region' : 'country'));
          setRankVisible(true);
        }
      }, CARD_FADE_MS);
    }, CARD_SWITCH_MS);

    return () => {
      window.clearInterval(panelTimer);
      if (fadeTimer !== null) {
        window.clearTimeout(fadeTimer);
      }
    };
  }, [ hasBoth ]);

  const getPanelStateClass = (target: 'recentMatches' | 'today') => {
    if (panel !== target) {
      return 'widget-statistics__panel--hidden';
    }
    return isPanelVisible ? 'widget-statistics__panel--active' : 'widget-statistics__panel--hiding';
  };

  return (
    <div className={classNames('widget-statistics', className)} style={cardStyle}>
      <WidgetStatisticsCommonPanel data={common} rankView={rankView} rankVisible={rankVisible}/>

      <div className='widget-statistics__divider'/>

      <div className='widget-statistics__panels'>
        <WidgetStatisticsDailyPanel data={daily} className={classNames('widget-statistics__panel', getPanelStateClass('today'))}/>
        <WidgetStatisticsRecentMatchesPanel data={recentMatches} className={classNames('widget-statistics__panel', getPanelStateClass('recentMatches'))}/>
      </div>
    </div>
  );
}
