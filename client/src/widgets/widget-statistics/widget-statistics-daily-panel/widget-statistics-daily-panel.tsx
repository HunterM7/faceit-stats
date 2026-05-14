import { classNames } from '@/utils/classNames';
import { formatNumberWithFixedDecimals } from '@/utils/number-format';
import { WidgetStatisticsPanelName } from '../widget-statistics-panel-name/widget-statistics-panel-name';
import { WidgetStatisticsMetric } from '../widget-statistics-metric/widget-statistics-metric';
import { MatchResult, WidgetStatisticsMatchResults } from '../widget-statistics-match-results/widget-statistics-match-results';
import './widget-statistics-daily-panel.scss';

interface Props {
  /** Статистика игрока за текущий игровой день. */
  data: {
    /** Количество побед за сегодня. */
    wins: number;
    /** Количество поражений за сегодня. */
    losses: number;
    /** Среднее количество убийств за матч. */
    avg: number;
    /** Среднее количество нанесенного урона за раунд. */
    adr: number;
    /** Соотношение убийств к смертям. */
    kd: number;
    /** Среднее количество убийств за раунд. */
    kr: number;
  };
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function WidgetStatisticsDailyPanel(props: Props) {
  const { data: { wins, losses, avg, adr, kd, kr }, className } = props;

  const avgAdr = `${formatNumberWithFixedDecimals(avg, 0)} / ${formatNumberWithFixedDecimals(adr, 0)}`;
  const kdKr = `${formatNumberWithFixedDecimals(kd, 2)} / ${formatNumberWithFixedDecimals(kr, 2)}`;

  return (
    <div className={classNames('widget-statistics-daily-panel', className)}>
      <WidgetStatisticsPanelName>STATS TODAY</WidgetStatisticsPanelName>
      <div className='widget-statistics-daily-panel__grid'>
        <div className='widget-statistics-daily-panel__match-results'>
          <WidgetStatisticsMatchResults value={wins} result={MatchResult.Win}/>
          <WidgetStatisticsMatchResults value={losses} result={MatchResult.Lose}/>
        </div>
        <WidgetStatisticsMetric className='widget-statistics-daily-panel__metric' value={avgAdr} label='AVG / ADR'/>
        <WidgetStatisticsMetric className='widget-statistics-daily-panel__metric' value={kdKr} label='K/D / K/R'/>
      </div>
    </div>
  );
}
