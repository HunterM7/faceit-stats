import type { ReactNode } from 'react'
import './widget-statistics-metric.scss'
import { classNames } from '@/utils/classNames';

type WidgetStatisticsMetricProps = {
  /** Отображаемое значение метрики. */
  value: ReactNode;
  /** Подпись метрики. */
  label: string;
  /** Дополнительный класс для стилизации компонента. */
  valueClassName?: string;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function WidgetStatisticsMetric(props: WidgetStatisticsMetricProps) {
  const { value, label, valueClassName, className } = props

  return (
    <div className={classNames('widget-statistics-metric', className)}>
      <div className={valueClassName ? `widget-statistics-metric__value ${valueClassName}` : 'widget-statistics-metric__value'}>{value}</div>
      <div className='widget-statistics-metric__label'>{label}</div>
    </div>
  )
}
