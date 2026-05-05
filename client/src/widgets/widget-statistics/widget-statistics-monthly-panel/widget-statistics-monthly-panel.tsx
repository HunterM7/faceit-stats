import { classNames } from '@/utils/classNames'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'
import { WidgetStatisticsMetric } from '../widget-statistics-metric/widget-statistics-metric'
import { WidgetStatisticsLast30WinRate } from '../widget-statistics-last30-win-rate/widget-statistics-last30-win-rate'
import './widget-statistics-monthly-panel.scss'

interface Props {
  /** Статистика игрока за последние 30 матчей. */
  data: {
    /** Винрейт в процентах. */
    winRatePercent: number;
    /** Кортеж побед/поражений в хронологическом порядке (true — победа, false — поражение). */
    results: boolean[];
    /** Среднее количество убийств за матч. */
    avg: number;
    /** Среднее количество нанесенного урона за раунд. */
    adr: number;
    /** Соотношение убийств к смертям. */
    kd: number;
    /** Количество убийств за раунд. */
    kr: number;
  };
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function WidgetStatisticsMonthlyPanel(props: Props) {
  const { data: { winRatePercent, results, avg, adr, kd, kr }, className } = props

  const avgAdr = `${formatNumberWithFixedDecimals(avg, 0)} / ${formatNumberWithFixedDecimals(adr, 0)}`
  const kdKr = `${formatNumberWithFixedDecimals(kd, 2)} / ${formatNumberWithFixedDecimals(kr, 2)}`

  return (
    <div className={classNames('widget-statistics-monthly-panel', className)}>
      <div className='widget-statistics-monthly-panel__title'>LAST 30 MATCHES</div>
      <div className='widget-statistics-monthly-panel__grid'>
        <WidgetStatisticsLast30WinRate winRatePercent={winRatePercent} matchResults={results} className='widget-statistics-monthly-panel__metric'/>
        <WidgetStatisticsMetric value={avgAdr} label='AVG / ADR' className='widget-statistics-monthly-panel__metric'/>
        <WidgetStatisticsMetric value={kdKr} label='K/D / K/R' className='widget-statistics-monthly-panel__metric'/>
      </div>
    </div>
  )
}
