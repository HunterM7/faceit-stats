# Input

Базовый компонент `Input` для текстовых полей.

## API

- Поддерживает стандартные `InputHTMLAttributes<HTMLInputElement>`.
- `className?: string` — внешний класс для страницы/контекста.
- `isClearable?: boolean` — показать кнопку очистки поля.
- `onChange?: (value: string) => void` — обработчик изменения значения.

## Пример

```tsx
<Input
  name='nickname'
  autoComplete='nickname'
  value={nickname}
  onChange={(value) => setNickname(value)}
  placeholder='например: s1mple'
/>
```
