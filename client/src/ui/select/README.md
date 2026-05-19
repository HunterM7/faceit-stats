# Select

Кастомный выпадающий список на `@radix-ui/react-select` в стиле тёмной темы приложения.

## API

- `value: string` — текущее значение.
- `options: readonly { value: string; label: string }[]` — варианты.
- `onChange?: (value: string) => void` — обработчик изменения.
- `className?: string` — внешний класс (ширина, отступы страницы).
- `disabled?: boolean` — неактивное состояние.
- `name?: string` — имя поля для форм.
- `ariaLabel?: string` — подпись для скринридеров.

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
  ariaLabel='Отображаемый рейтинг'
/>
```
