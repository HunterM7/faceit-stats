import type { PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames'
import './stats-widget-card-value.scss'

type StatsWidgetCardValueProps = {
  /** Подпись под значением. */
  label: string;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент для отображения значения в статистической карточке. */
export function StatsWidgetCardValue(props: PropsWithChildren<StatsWidgetCardValueProps>) {
  const { label, className, children } = props

  return (
    <div className={classNames('stats-widget-card-value', className)}>
      {children}
      <div className='stats-widget-card-value__label'>{label}</div>
    </div>
  )
}
