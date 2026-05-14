import { classNames } from '@/utils/classNames';
import { formatNumberWithFixedDecimals } from '@/utils/number-format';
import { ChallengerTier, ChallengerTierIcon } from '@/components/challenger-tier-icon/challenger-tier-icon';
import { useMemo } from 'react';
import { SkillLevelIcon } from '@/components/skill-level-icon/skill-level-icon';
import { WidgetStatisticsValue } from '../widget-statistics-value/widget-statistics-value';
import { WidgetStatisticsCommonPanelRating } from './widget-statistics-common-panel-rating/widget-statistics-common-panel-rating';
import type { Rank } from '@requests/stats';
import './widget-statistics-common-panel.scss';

interface Props {
  /** Общая статистика игрока. */
  data: {
    /** Текущий уровень FACEIT игрока. */
    skillLevel: number;
    /** Текущее значение ELO игрока. */
    elo: number;
    /** Текущее значение K/D игрока. */
    kd: number;
    /** Ранг игрока. */
    rank: Rank;
  };
  /** Какой блок ранга сейчас виден (страна/регион). */
  rankView: 'country' | 'region';
  /** Флаг видимости текущего блока ранга для анимации. */
  rankVisible: boolean;
}

export function WidgetStatisticsCommonPanel(props: Props) {
  const { data: { skillLevel, elo, kd, rank }, rankView, rankVisible } = props;

  const challengerTier = useMemo(() => {
    if (!rank.region?.rating || rank.region.rating > 1000) {
      return;
    }
    switch (rank.region.rating) {
    case 1:
      return ChallengerTier.Gold;
    case 2:
      return ChallengerTier.Silver;
    case 3:
      return ChallengerTier.Bronze;
    default:
      return ChallengerTier.Other;
    }
  }, [ rank.region?.rating ]);

  const switchable = rank.country && rank.region;

  const getRankSlideClass = (target: 'country' | 'region') => {
    if (!switchable) {
      return target == rankView
        ? 'widget-statistics-common-panel__rank-item--active'
        : 'widget-statistics-common-panel__rank-item--hidden';
    }
    if (rankView !== target) {
      return 'widget-statistics-common-panel__rank-item--hidden';
    }
    return rankVisible ? 'widget-statistics-common-panel__rank-item--active' : 'widget-statistics-common-panel__rank-item--hidden';
  };

  return (
    <div className='widget-statistics-common-panel'>
      <div className='widget-statistics-common-panel__level-badge'>
        {challengerTier
          ? <ChallengerTierIcon tier={challengerTier} className='widget-statistics-common-panel__level-icon'/>
          : <SkillLevelIcon skillLevel={skillLevel} className='widget-statistics-common-panel__level-icon'/>
        }
        <WidgetStatisticsValue label='ELO'>{elo}</WidgetStatisticsValue>
      </div>

      <WidgetStatisticsValue label='K/D' className='widget-statistics-common-panel__kd'>
        {formatNumberWithFixedDecimals(kd, 2)}
      </WidgetStatisticsValue>

      <WidgetStatisticsValue label='RANK' className='widget-statistics-common-panel__rank'>
        {rank.country && rank.region && (
          <>
            <WidgetStatisticsCommonPanelRating
              type='country'
              code={rank.country.code}
              rating={rank.country.rating}
              className={classNames('widget-statistics-common-panel__rank-item', getRankSlideClass('country'))}
            />
            <WidgetStatisticsCommonPanelRating
              type='region'
              code={rank.region.code}
              rating={rank.region.rating}
              className={classNames('widget-statistics-common-panel__rank-item', getRankSlideClass('region'))}
            />
          </>
        )}
        {rank.country && !rank.region && (
          <WidgetStatisticsCommonPanelRating
            type='country'
            code={rank.country.code}
            rating={rank.country.rating}
            className={classNames('widget-statistics-common-panel__rank-item', 'widget-statistics-common-panel__rank-item--active')}
          />
        )}
        {rank.region && !rank.country && (
          <WidgetStatisticsCommonPanelRating
            type='region'
            code={rank.region.code}
            rating={rank.region.rating}
            className={classNames('widget-statistics-common-panel__rank-item', 'widget-statistics-common-panel__rank-item--active')}
          />
        )}
      </WidgetStatisticsValue>
    </div>
  );
}
