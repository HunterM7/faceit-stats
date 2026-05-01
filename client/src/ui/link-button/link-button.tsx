import { type PropsWithChildren } from 'react'
import { classNames } from '@/utils/classNames'
import './link-button.scss'

interface LinkButtonProps {
  /** URL ссылки. */
  href: string;
  /** Признак неактивного состояния. */
  disabled?: boolean | undefined;
  /** Атрибут target для ссылки. */
  target: HTMLAnchorElement['target'];
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент ссылки в виде кнопки. */
export function LinkButton(props: PropsWithChildren<LinkButtonProps>) {
  const { className, disabled, href, ...rest } = props
  return <a className={classNames('link-button', disabled && 'link-button--disabled', className)} href={href} {...rest}/>
}
