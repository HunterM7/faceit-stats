import type { ReactNode } from 'react'
import './stats-widget-card-metric.scss'
import { classNames } from '@/utils/classNames';

type StatsWidgetCardMetricProps = {
  /** Отображаемое значение метрики. */
  value: ReactNode;
  /** Подпись метрики. */
  label: string;
  /** Дополнительный класс для стилизации компонента. */
  valueClassName?: string;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function StatsWidgetCardMetric(props: StatsWidgetCardMetricProps) {
  const { value, label, valueClassName, className } = props

  return (
    <div className={classNames('stats-widget-card-metric', className)}>
      <div className={valueClassName ? `stats-widget-card-metric__value ${valueClassName}` : 'stats-widget-card-metric__value'}>{value}</div>
      <div className='stats-widget-card-metric__label'>{label}</div>
    </div>
  )
}
