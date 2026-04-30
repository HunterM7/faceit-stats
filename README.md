# FACEIT Stats (React + TypeScript)

Проект переведен на React и разложен по директориям:

- `client` — React UI (роуты `/matchResult` и `/stats`)
- `server` — NestJS stateless API (`@nestjs/config` для env-конфига)

## Зафиксированная целевая модель (обновлено)

Текущая целевая архитектура: **Cloud Stateless (Vercel)** c разделением доменов.

- клиент и сервер деплоятся на Vercel как отдельные проекты;
- сайт: `https://DOMAIN.com`;
- API: `https://api.DOMAIN.com`;
- для пользователя все работает через URL вида:
  `https://DOMAIN.com/НАЗВАНИЕ_СТРАНИЦЫ?...`;
- данные пользователя и настройки берутся из query params;
- классическую БД в целевой версии **не используем**;
- для server-side аналитики админки используется MongoDB Atlas (M0 free tier);
- максимум локальный `localStorage` в браузере для UX (например, подставить последний nickname).

Пример целевого URL:

`https://НАШ_САЙТ/stats?nickname=НИК_ПОЛЬЗОВАТЕЛЯ`

## Установка

```bash
npm install
```

## Настройка

Скопируй `.env.example` в `.env` и заполни:

- `FACEIT_API_KEY`
- `PORT` (опционально, по умолчанию `3333`)
- `VITE_SERVER_URL` (адрес сервера для клиента; локально `http://localhost:3333`)
- `CLIENT_URL` (адрес клиента для CORS на сервере; локально `http://localhost:5173`, в проде `https://DOMAIN.com`)
- `MONGODB_URI` (строка подключения MongoDB Atlas)
- `MONGODB_DB_NAME` (опционально, имя БД для аналитики; по умолчанию `faceit_stats`)
- `ADMIN_LOGIN` (логин для доступа к `/api/admin/*`)
- `ADMIN_PASSWORD` (пароль для доступа к `/api/admin/*`)

Важно про именование env:
- `VITE_SERVER_URL` начинается с `VITE_` только потому, что это требование Vite для клиентских переменных.
- Без префикса `VITE_` переменная не будет доступна в коде `client`.
- `CLIENT_URL` и `FACEIT_API_KEY` используются на сервере, поэтому им префикс `VITE_` не нужен.

Для stateless-режима nickname всегда передается в URL:

- `/stats?nickname=...`
- `/matchResult?nickname=...`

## Запуск

- Production-like запуск:
  ```bash
  npm start
  ```
- Dev режим (React + server одновременно):
  ```bash
  npm run dev
  ```

## URLs (локально)

- Landing page: `http://localhost:5173/`
- MatchResult page (React): `http://localhost:5173/matchResult`
- Stats widget (React): `http://localhost:5173/stats`
- Admin dashboard: `http://localhost:5173/admin`
- Stats Widget builder: `http://localhost:5173/widgets/stats`
- Match Result Widget builder: `http://localhost:5173/widgets/match-result`

Подробная документация по админке: `client/src/pages/admin-page/README.md`.

## Доступные виджеты

Сейчас в проекте доступны 2 виджета:

1. **Stats Widget**  
   Показывает статистику игрока, собранную в удобном виджете: общие данные за все время и отдельный блок по последним 30 матчам.

2. **Match Result Widget**  
   Виджет-оверлей, который отображает в конце игры результат матча, текущий уровень и разницу ELO (`+/-` значение).

## OBS

Добавь два Browser Source:

- `http://localhost:5173/matchResult` — анимация победа/поражение
- `http://localhost:5173/stats` — виджет статистики

Для Vercel-деплоя используются те же клиентские маршруты, но на основном домене:

- `https://DOMAIN.com/matchResult?...`
- `https://DOMAIN.com/stats?...`

Клиент обращается к API по `VITE_SERVER_URL`, для прода укажи:

- `VITE_SERVER_URL=https://api.DOMAIN.com`

## FACEIT API: что зафиксировано по официальной документации

Источники:

- Data API: `https://docs.faceit.com/docs/data-api/data/`
- Data API auth: `https://docs.faceit.com/docs/data-api/`
- Webhooks: `https://docs.faceit.com/docs/webhooks/`
- Event Notifications: `https://docs.faceit.com/getting-started/Guides/event-notifications/`

Ключевые факты:

- FACEIT Data API использует `Authorization: Bearer <api_key>`.
- Для нашей задачи достаточно публичных эндпоинтов Data API:
  - `GET /players` (поиск игрока по нику)
  - `GET /players/{player_id}` (текущий `faceit_elo`, `skill_level`)
  - `GET /players/{player_id}/history` (последние матчи, `status`, `results.winner`, `match_id`)
  - опционально `GET /matches/{match_id}` и `/matches/{match_id}/stats`
- В спецификации эндпоинтов присутствует `429 Too many requests` -> polling должен быть аккуратным и с backoff.
- Официальные real-time уведомления в FACEIT реализованы через **Webhooks** (POST на ваш endpoint).

## Что выбрано по архитектуре

### 1) Почему без БД

Для текущего продукта выбрана stateless-модель:

- не храним пользовательские профили/настройки в базе;
- все нужные параметры передаются в URL (для stats виджета это `nickname`);
- при необходимости UI может сохранять последнее введенное значение только в `localStorage`.

### 2) Почему сейчас polling, а не webhook

Webhook на Vercel технически возможен, но для текущей stateless-модели он не обязателен.

Выбран подход:

- `client` вызывает наш API с `nickname`;
- `server` обращается к FACEIT Data API;
- клиент обновляется polling-ом с разумным интервалом;
- серверный API key остается в env и не утекает в браузер.

## Vercel: как развернуть DOMAIN + api.DOMAIN

1. Создай два Vercel-проекта из одного репозитория:
- `faceit-web` с Root Directory = `client`
- `faceit-api` с Root Directory = `server`
2. Назначь домены:
- `faceit-web` -> `DOMAIN.com`
- `faceit-api` -> `api.DOMAIN.com`
3. Добавь env:
- В `faceit-web`: `VITE_SERVER_URL=https://api.DOMAIN.com`
- В `faceit-api`: `FACEIT_API_KEY=...`, `CLIENT_URL=https://DOMAIN.com`, `MONGODB_URI=...`, `MONGODB_DB_NAME=faceit_stats`, `ADMIN_LOGIN=...`, `ADMIN_PASSWORD=...`

Почему это подходит:

- проще для эксплуатации;
- меньше инфраструктуры;
- не нужно держать отдельный state-store.

### 3) Когда вернемся к webhook

Webhook стоит включать, только если появится требование:

- мгновенное событие по окончанию матча;
- централизованный event pipeline;
- доставка событий нескольким клиентам из одного источника.

Пока это **не целевой режим**.

## Быстрый smoke-check

- `GET /api/playerStatistics?nickname=ТВОЙ_FACEIT_NICK`
- `GET /api/player?nickname=ТВОЙ_FACEIT_NICK`
- `GET /api/lastMatch?playerId=FACEIT_PLAYER_ID`
- `GET /api/duoMatches?nickname=ТВОЙ_FACEIT_NICK&teammateNickname=NICK_ТИММЕЙТА`
