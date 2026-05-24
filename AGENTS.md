# Инструкции для AI-агентов

Перед изменениями в репозитории учитывайте правила в [`.cursor/rules/`](.cursor/rules/).

## Обязательно

- **БЭМ** — один блок на компонент, все стили внутри `.block { }`; см. [`.cursor/rules/bem-scss.mdc`](.cursor/rules/bem-scss.mdc).
- **Без ARIA** — не добавлять `aria-*` и a11y-`role`; см. [`.cursor/rules/no-aria.mdc`](.cursor/rules/no-aria.mdc).

Правила с `alwaysApply: true` действуют в каждой сессии автоматически.
