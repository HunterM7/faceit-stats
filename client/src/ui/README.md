# UI Components

Папка `ui` хранит базовые интерфейсные примитивы, которые переиспользуются на разных страницах.

## Принципы

- Компоненты должны быть максимально простыми и предсказуемыми.
- Компоненты не должны содержать бизнес-логику страниц.
- Стили базового состояния лежат рядом с компонентом.
- Специфичные стили страницы задаются через `className` снаружи.

## Компоненты

- `button/button.tsx` — базовая кнопка `Button` с вариантами:
  - `primary`
  - `secondary`
  - `danger`

## Пример

```tsx
import { Button, ButtonVariant } from '@/ui/button/button'

<Button variant={ButtonVariant.Primary} onClick={handleClick}>
  Сохранить
</Button>
```
