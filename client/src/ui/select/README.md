# Select

Кастомный выпадающий список без внешних UI-библиотек. Скролл страницы не блокируется.

## API

- `value: string` — текущее значение.
- `options: readonly { value: string; label: string }[]` — варианты.
- `onChange?: (value: string) => void` — обработчик изменения.
- `className?: string` — внешний класс (ширина, отступы страницы).
- `disabled?: boolean` — неактивное состояние.
- `name?: string` — скрытое поле для отправки формы.

Подпись поля — видимый текст рядом (`<label>`, `<p>`), без ARIA (см. `.cursor/rules/no-aria.mdc`).

## Клавиатура

- **Tab** — фокус на поле.
- **Enter / Space / ↓ / ↑** — открыть список.
- **↓ / ↑** — перемещение по пунктам.
- **Home / End** — первый / последний пункт.
- **Enter / Space** — выбрать подсвеченный пункт.
- **Escape / Tab** — закрыть без выбора (Tab — с переходом дальше).

## Пример

```tsx
<Select
  value={ratingMode}
  options={[
    { value: 'country', label: 'Только страна' },
    { value: 'region', label: 'Только регион' },
    { value: 'both', label: 'Страна и регион' },
  ]}
  onChange={setRatingMode}
/>
```
