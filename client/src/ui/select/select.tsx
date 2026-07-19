import { useEffect, useRef, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { Key, useKeyDown } from '@/utils/use-key-down';
import './select.scss';

export type SelectOption<T = string> = {
  value: T;
  label: string;
};

interface SelectProps<T> {
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
}

/** Кастомный выпадающий список без внешних UI-библиотек. */
export function Select<T>(props: SelectProps<T>) {
  const { value, options, onChange, className, disabled, name } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selectedLabel = options[selectedIndex]?.label ?? String(value);

  const [ open, setOpen ] = useState(false);
  const [ activeIndex, setActiveIndex ] = useState(selectedIndex);

  const openList = () => {
    if (disabled) {
      return;
    }

    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const selectIndex = (index: number) => {
    const option = options[index];
    if (!option) {
      return;
    }

    if (option.value !== value) {
      onChange?.(option.value);
    }

    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [ open ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const items = rootRef.current?.querySelectorAll<HTMLButtonElement>('.select__item');
    items?.[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [ activeIndex, open ]);

  const handleKeyDown = useKeyDown(
    [
      {
        key: Key.ArrowDown,
        callback: (event) => {
          event.preventDefault();
          if (open) {
            setActiveIndex((current) => Math.min(options.length - 1, current + 1));
          } else {
            openList();
          }
        },
      },
      {
        key: Key.ArrowUp,
        callback: (event) => {
          event.preventDefault();
          if (open) {
            setActiveIndex((current) => Math.max(0, current - 1));
          } else {
            openList();
          }
        },
      },
      {
        key: Key.Home,
        callback: (event) => {
          if (open) {
            event.preventDefault();
            setActiveIndex(0);
          }
        },
      },
      {
        key: Key.End,
        callback: (event) => {
          if (open) {
            event.preventDefault();
            setActiveIndex(options.length - 1);
          }
        },
      },
      {
        key: [ Key.Enter, Key.Space ],
        callback: (event) => {
          event.preventDefault();
          if (open) {
            selectIndex(activeIndex);
          } else {
            openList();
          }
        },
      },
      {
        key: Key.Escape,
        callback: (event) => {
          if (open) {
            event.preventDefault();
            setOpen(false);
          }
        },
      },
      {
        key: Key.Tab,
        callback: () => {
          if (open) {
            setOpen(false);
          }
        },
      },
    ],
    { enabled: !disabled },
  );

  return (
    <div
      ref={rootRef}
      className={classNames('select', open && 'select--open', className)}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type='button'
        className='select__trigger'
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className='select__value'>{selectedLabel}</span>
        <span className='select__chevron'/>
      </button>

      {name ? <input type='hidden' name={name} value={String(value)}/> : null}

      {open ? (
        <div className='select__content'>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.label}
                type='button'
                className={classNames(
                  'select__item',
                  isSelected && 'select__item--selected',
                  isActive && 'select__item--active',
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectIndex(index)}
              >
                <span className='select__item-text'>{option.label}</span>
                {isSelected ? <span className='select__check'/> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
