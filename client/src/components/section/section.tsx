import type { PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames';
import './section.scss';

interface Props {
  /** Заголовок секции. */
  title?: string | undefined;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function Section(props: PropsWithChildren<Props>) {
  const { title, children, className } = props;

  return <section className={classNames('section', className)}>
    {title && <h2 className='section__title'>{title}</h2>}
    {children}
  </section>;
}
