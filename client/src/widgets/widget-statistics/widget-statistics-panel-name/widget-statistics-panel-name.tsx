import type { PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames';
import './widget-statistics-panel-name.scss';

interface Props {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Заголовок панели со статистикой. */
export function WidgetStatisticsPanelName(props: PropsWithChildren<Props>) {
  const { children, className } = props;
  return (
    <div className={classNames('widget-statistics-panel-name', className)}>
      <span className='widget-statistics-panel-name__text'>{children}</span>
    </div>
  );
}
