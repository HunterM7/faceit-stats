import { useCallback, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { classNames } from '@/utils/classNames'
import './input.scss'

interface InputProps extends Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'autoComplete' | 'placeholder' | 'disabled' | 'readOnly'> {
  /** Значение поля. */
  value?: string | undefined;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
  /** Показать кнопку очистки поля. */
  isClearable?: boolean | undefined;
  /** Обработчик очистки поля. */
  onChange?: ((value: string) => void) | undefined;
}

/** Базовый компонент текстового поля ввода. */
export function Input(props: InputProps) {
  const { className, isClearable, value, disabled, readOnly, onChange, ...rest } = props

  const canClear = Boolean(isClearable && value && !disabled && !readOnly)

  const onClearHandler = useCallback(() => {
    if (!canClear) {
      return
    }
    onChange?.('')
  }, [ canClear, onChange ])

  const onChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }, [ onChange ])

  return (
    <div className={classNames('input', className)}>
      <input
        className={classNames('input__field', canClear && 'input__field--clearable')}
        value={value} disabled={disabled} readOnly={readOnly} onChange={onChangeHandler} {...rest}
      />
      {canClear && (
        <button type='button' className='input__clear' onClick={onClearHandler} aria-label='Очистить поле'>
          ×
        </button>
      )}
    </div>
  )
}
