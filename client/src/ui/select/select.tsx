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

function SelectChevronIcon() {
  return (
    <svg className='select__chevron' width='16' height='16' viewBox='0 0 16 16' aria-hidden='true'>
      <path
        d='M4 6l4 4 4-4'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function SelectCheckIcon() {
  return (
    <svg className='select__check' width='14' height='14' viewBox='0 0 14 14' aria-hidden='true'>
      <path
        d='M2.5 7.2 5.4 10.1 11.5 4'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
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
        <RadixSelect.Icon className='select__icon' asChild>
          <span>
            <SelectChevronIcon/>
          </span>
        </RadixSelect.Icon>
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
                <RadixSelect.ItemIndicator className='select__item-indicator'>
                  <SelectCheckIcon/>
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
