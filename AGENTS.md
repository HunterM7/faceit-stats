# Инструкции для AI-агентов

Перед изменениями в репозитории учитывайте правила в [`.cursor/rules/`](.cursor/rules/).

## Обязательно

- **Документация API** — публичные пропсы, поля объектов, методы `ref` и т.п.: JSDoc кратко, но по смыслу полно; см. [`.cursor/rules/jsdoc-public-api.mdc`](.cursor/rules/jsdoc-public-api.mdc).
- **Минимальный код** — только необходимое для задачи, без лишних обёрток и шаблонного шума; см. [`.cursor/rules/minimal-code.mdc`](.cursor/rules/minimal-code.mdc).
- **Один компонент — один модуль** — не объявлять второй React-компонент в том же файле; выносить в соседнюю папку; см. [`.cursor/rules/one-component-per-module.mdc`](.cursor/rules/one-component-per-module.mdc).
- **TypeScript** — в основном `interface`; закрытые наборы вариантов — `enum` (не строковый union); опциональные поля в наших контрактах — `?` и `| undefined` (не для DTO ответа сервера); см. [`.cursor/rules/typescript-interface.mdc`](.cursor/rules/typescript-interface.mdc).
- **БЭМ** — один блок на компонент, все стили внутри `.block { }`; см. [`.cursor/rules/bem-scss.mdc`](.cursor/rules/bem-scss.mdc).
- **Без ARIA** — не добавлять `aria-*` и a11y-`role`; см. [`.cursor/rules/no-aria.mdc`](.cursor/rules/no-aria.mdc).

Правила с `alwaysApply: true` действуют в каждой сессии автоматически.
