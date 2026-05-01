# Button

`Button` — базовая UI-кнопка для действий.

## Импорт

```tsx
import { Button, ButtonVariant } from '@/ui/button/button'
```

## Пропсы

- `variant` (`ButtonVariant`) — вид кнопки:
  - `ButtonVariant.Primary`
  - `ButtonVariant.Secondary`
  - `ButtonVariant.Danger`
- Остальные пропсы прокидываются в нативный `<button>`.

## Пример

```tsx
<Button variant={ButtonVariant.Primary} onClick={handleClick}>
  Сохранить
</Button>
```
