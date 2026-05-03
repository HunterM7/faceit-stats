import type { PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames'
import './widget-statistics-value.scss'

type WidgetStatisticsValueProps = {
  /** Подпись под значением. */
  label: string;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент для отображения значения в статистической карточке. */
export function WidgetStatisticsValue(props: PropsWithChildren<WidgetStatisticsValueProps>) {
  const { label, className, children } = props

  return (
    <div className={classNames('widget-statistics-value', className)}>
      {children}
      <div className='widget-statistics-value__label'>{label}</div>
    </div>
  )
}
