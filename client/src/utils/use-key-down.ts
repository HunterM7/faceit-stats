import { useCallback, type KeyboardEvent, type KeyboardEventHandler } from 'react';
import { Key } from './key';

export { Key } from './key';

const MODIFIER_KEYS = new Set<Key>([ Key.Control, Key.Shift, Key.Alt, Key.Meta ]);

export type KeyDownBinding = {
  /**
   * Клавиша или несколько вариантов с одним callback.
   * Массив из модификаторов и клавиши — сочетание, например `[Key.Control, Key.S]`.
   * Массив обычных клавиш — любая из них, например `[Key.Enter, Key.Space]`.
   */
  key: Key | readonly Key[];
  callback: (event: KeyboardEvent<HTMLElement>) => void;
};

export type UseKeyDownOptions = {
  /** Если `false`, обработчик ничего не делает. */
  enabled?: boolean | undefined;
};

function matchesKey(event: KeyboardEvent, key: Key | readonly Key[]): boolean {
  if (!Array.isArray(key)) {
    return event.key === key;
  }

  const parts = [ ...key ];
  const modifierParts = parts.filter((part) => MODIFIER_KEYS.has(part));
  const mainKeys = parts.filter((part) => !MODIFIER_KEYS.has(part));

  if (modifierParts.length > 0 && mainKeys.length === 1) {
    const [ mainKey ] = mainKeys;
    if (event.key !== mainKey) {
      return false;
    }

    if (modifierParts.includes(Key.Control) && !event.ctrlKey) {
      return false;
    }

    if (modifierParts.includes(Key.Shift) && !event.shiftKey) {
      return false;
    }

    if (modifierParts.includes(Key.Alt) && !event.altKey) {
      return false;
    }

    if (modifierParts.includes(Key.Meta) && !event.metaKey) {
      return false;
    }

    return true;
  }

  return parts.includes(event.key as Key);
}

/**
 * Возвращает обработчик `onKeyDown` по списку привязок клавиш.
 * Первое совпадение вызывает callback и останавливает проверку.
 */
export function useKeyDown(
  bindings: readonly KeyDownBinding[],
  options?: UseKeyDownOptions,
): KeyboardEventHandler<HTMLElement> {
  const enabled = options?.enabled ?? true;

  return useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (!enabled) {
      return;
    }

    for (const binding of bindings) {
      if (!matchesKey(event, binding.key)) {
        continue;
      }

      binding.callback(event);
      return;
    }
  }, [ bindings, enabled ]);
}
