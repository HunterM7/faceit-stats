# Admin Dashboard (`/admin`)

## Что это сейчас

Админка теперь работает от **серверной аналитики**, которая собирается на backend и хранится в MongoDB Atlas.

Панель отвечает на вопросы:

- сколько было запросов за период;
- сколько уникальных пользователей (по FACEIT-никам);
- какие никнеймы самые частые;
- какие события происходили последними.

## Архитектура

### Клиент

- Страница: `client/src/pages/admin-page/admin-page.tsx`
- API-запрос: `client/src/requests/admin.ts`
- Маршрут: `/admin`

Клиент не хранит аналитику локально, а читает её с backend:

- `GET /api/admin/overview?period=day|week|month|all`

### Сервер

- Модуль: `server/src/modules/admin-analytics/admin-analytics.module.ts`
- Сервис: `server/src/modules/admin-analytics/admin-analytics.service.ts`
- Контроллер: `server/src/modules/admin-analytics/admin-analytics.controller.ts`
- Интерсептор трекинга: `server/src/modules/admin-analytics/admin-analytics.interceptor.ts`

Интерсептор автоматически логирует каждый запрос к `/api/*` (кроме `/api/admin*`), чтобы не зациклить аналитику на самой админке.

## Что логируется

Для каждого запроса пишется событие:

- `timestamp`
- `route`
- `statusCode`
- `durationMs`
- `nicknames[]` (если в query есть `nickname` / `teammateNickname`)

## Где хранится

Хранилище: **MongoDB Atlas**, коллекция `admin_events`.

## Что показывает админка

- KPI:
  - число запросов
  - число уникальных пользователей
  - число ников в топе
- График активности:
  - day: 1 точка
  - week: 7 точек
  - month/all: 30 точек
- Топ никнеймов (до 12)
- Последние события (до 20)

## Обязательные ENV для сервера

Добавь в Vercel проект API:

- `FACEIT_API_KEY`
- `CLIENT_URL`
- `MONGODB_URI`
- `MONGODB_DB_NAME` (опционально, по умолчанию `faceit_stats`)
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD`

Если MongoDB не настроен, админка не падает, но вернет пустые данные и `storage: "disabled"`.

## Как проверить локально

1. Подними сервер и клиент.
2. Убедись, что в `server/.env` прописаны MongoDB переменные.
3. Открой страницы и сделай несколько запросов:
   - `/stats?nickname=...`
   - `/matchResult?nickname=...`
   - `/duo?...`
4. Открой `http://localhost:5173/admin` и проверь:
   - смену периодов;
   - обновление KPI;
   - список ников;
   - последние события.

## Что желательно добавить дальше

- Защиту `/api/admin/*` (например, `x-admin-key` или JWT).
- Rate limit на админ-эндпоинты.
- Отдельные блоки по ошибкам и p95 latency.
- Экспорт CSV для топа и событий.
