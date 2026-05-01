import { type PropsWithChildren } from 'react'
import { classNames } from '@/utils/classNames'
import { ButtonVariant } from './utils/interface'
import './button.scss'

export { ButtonVariant }

interface ButtonProps {
  /** Вид кнопки. */
  variant: ButtonVariant;
  /** Признак неактивности кнопки. */
  disabled?: boolean | undefined;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
  /** Обработчик нажатия кнопки. */
  onClick: () => void;
}

/** Компонент кнопки. */
export function Button(props: PropsWithChildren<ButtonProps>) {
  const { className, variant, disabled, ...rest } = props
  return <button type='button' className={classNames('button', `button--${variant}`, className)} disabled={disabled} {...rest}/>
}
