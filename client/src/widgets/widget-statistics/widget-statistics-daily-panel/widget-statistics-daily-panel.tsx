import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { WidgetStatisticsMetric } from '../widget-statistics-metric/widget-statistics-metric'
import { MatchResult, WidgetStatisticsMatchResults } from '../widget-statistics-match-results/widget-statistics-match-results'
import './widget-statistics-daily-panel.scss'

interface Props {
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
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function WidgetStatisticsDailyPanel(props: Props) {
  const { wins, losses, avg, adr, kd, className } = props

  const avgAdr = `${formatNumberWithFixedDecimals(avg, 0)} / ${formatNumberWithFixedDecimals(adr, 2)}`

  return (
    <div className={classNames('widget-statistics-daily-panel', className)}>
      <div className='widget-statistics-daily-panel__title'>STATS TODAY</div>
      <div className='widget-statistics-daily-panel__grid'>
        <div className='widget-statistics-daily-panel__match-results'>
          <WidgetStatisticsMatchResults value={wins} result={MatchResult.Win}/>
          <WidgetStatisticsMatchResults value={losses} result={MatchResult.Lose}/>
        </div>
        <WidgetStatisticsMetric className='widget-statistics-daily-panel__metric' value={avgAdr} label='Avg. Kills / ADR'/>
        <WidgetStatisticsMetric className='widget-statistics-daily-panel__metric' value={formatNumberWithFixedDecimals(kd, 2)} label='K/D'/>
      </div>
    </div>
  )
}
