import type { ReactNode } from 'react'
import './stats-widget-card-metric.scss'

type StatsWidgetCardMetricProps = {
  /** Отображаемое значение метрики. */
  value: ReactNode
  /** Подпись метрики. */
  label: string
  /** Дополнительный класс для стилизации компонента. */
  valueClassName?: string
}

export function StatsWidgetCardMetric({ value, label, valueClassName }: StatsWidgetCardMetricProps) {
  return (
    <div className='stats-widget-card-metric'>
      <div className={valueClassName ? `stats-widget-card-metric__value ${valueClassName}` : 'stats-widget-card-metric__value'}>{value}</div>
      <div className='stats-widget-card-metric__label'>{label}</div>
    </div>
  )
}
