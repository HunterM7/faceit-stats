# Input

Базовый компонент `Input` для текстовых полей.

## API

- Поддерживает стандартные `InputHTMLAttributes<HTMLInputElement>`.
- `className?: string` — внешний класс для страницы/контекста.
- `isClearable?: boolean` — показать кнопку очистки поля.
- `onClear?: () => void` — обработчик очистки.

## Пример

```tsx
<Input
  name='nickname'
  autoComplete='nickname'
  value={nickname}
  onChange={(event) => setNickname(event.target.value)}
  placeholder='например: s1mple'
/>
```
