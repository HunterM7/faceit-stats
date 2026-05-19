import * as RadixSelect from '@radix-ui/react-select';
import { classNames } from '@/utils/classNames';
import './select.scss';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

interface SelectProps<T extends string> {
  /** Текущее значение. */
  value: T;
  /** Список вариантов. */
  options: readonly SelectOption<T>[];
  /** Обработчик изменения значения. */
  onChange?: ((value: T) => void) | undefined;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
  /** Признак неактивности. */
  disabled?: boolean | undefined;
  /** Имя поля для форм. */
  name?: string | undefined;
  /** Подпись для скринридеров. */
  ariaLabel?: string | undefined;
}

/** Кастомный выпадающий список в стиле тёмной темы приложения. */
export function Select<T extends string>(props: SelectProps<T>) {
  const { value, options, onChange, className, disabled, name, ariaLabel } = props;

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={(next) => onChange?.(next as T)}
      disabled={disabled}
      name={name}
    >
      <RadixSelect.Trigger
        className={classNames('select', className)}
        aria-label={ariaLabel}
      >
        <RadixSelect.Value className='select__value'/>
        <span className='select__chevron'/>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className='select__content'
          position='popper'
          sideOffset={6}
          align='start'
        >
          <RadixSelect.Viewport className='select__viewport'>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className='select__item'
              >
                <RadixSelect.ItemText className='select__item-text'>
                  {option.label}
                </RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className='select__item-indicator select__check'/>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
