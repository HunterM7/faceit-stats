# SEO (`client/src/seo`)

Документация по поисковой оптимизации клиента: как устроена, что менять и как проверять.

## Цель

Повысить шанс попадания в выдачу по запросам вроде:

- «faceit виджет obs» / «фейсит виджет для стрима»
- «faceit elo виджет» / «статистика faceit на стрим»
- «cs2 faceit overlay» / «faceit widget obs»

Ориентиры по конкурентам (Hudify, FACEIT Live Stats, Strugly, Tapit): keyword-rich title/description, FAQ + HowTo на лендинге, Schema.org JSON-LD, `noindex` для технических URL.

## Ограничение Vite SPA

Клиент — SPA. Meta и JSON-LD после гидрации выставляет React.

- **Боты с JS** (Google обычно) видят актуальные title/description/canonical и schema после выполнения `usePageSeo`.
- **Боты без JS / первый HTML** получают только то, что в `client/index.html` (дефолты главной + базовый `SoftwareApplication`).

Поэтому дефолты в `index.html` должны совпадать с SEO главной. Prerender/SSR пока **не** включены — это следующий возможный шаг.

## Архитектура (поток)

```
Смена маршрута (react-router)
        │
        ▼
usePageSeo()                    ← client/src/seo/usePageSeo.ts
        │  вызывается из AppRoutes
        ▼
applyPageSeo(pathname)          ← client/src/seo/applyPageSeo.ts
        │
        ├─► PAGE_SEO_BY_PATH[pathname]   ← pageSeo.ts
        ├─► document.title + meta + canonical + OG/Twitter
        └─► JSON-LD (landingJsonLd.ts)
              ├─ главная: SoftwareApplication + FAQPage + HowTo
              ├─ другие indexable: только SoftwareApplication
              └─ noindex-страницы: FAQ/HowTo снимаются
```

Видимый SEO-контент лендинга (не только meta):

- HowTo UI ← `landing-page-howto` + данные `landingHowTo.ts`
- FAQ UI ← `landing-page-faq` + данные `landingFaq.ts`

**Важно:** тексты FAQ/HowTo в UI и в JSON-LD берутся из **одних и тех же** массивов (`LANDING_FAQ_ITEMS`, `LANDING_HOWTO_*`), чтобы schema не расходилась со страницей.

## Файлы модуля

| Файл | Роль |
|------|------|
| `site.ts` | Имя продукта, дефолтный title/description, `getSiteOrigin()` |
| `pageSeo.ts` | Карта маршрутов → title / description / robots / флаг JSON-LD |
| `applyPageSeo.ts` | Запись в `document.head` |
| `usePageSeo.ts` | Хук: `pathname` → `applyPageSeo` |
| `landingFaq.ts` | Вопросы/ответы FAQ (UI + FAQPage) |
| `landingHowTo.ts` | Шаги HowTo (UI + HowTo schema) |
| `landingJsonLd.ts` | Сборка и upsert/remove `<script type="application/ld+json">` |

Связанные места вне модуля:

| Путь | Роль |
|------|------|
| `client/index.html` | Статический baseline для ботов и первого paint |
| `client/public/robots.txt` | Allow/Disallow для краулеров |
| `client/src/app-routes.tsx` | Подключение `usePageSeo()` |
| `client/src/pages/landing-page/...` | Hero, HowTo, FAQ на `/` |
| H1 на страницах виджетов | Ключевые формулировки в видимом контенте |

## Логика `PageSeo`

Интерфейс (`pageSeo.ts`):

- `title` — `<title>`, `og:title`, `twitter:title`
- `description` — `meta description`, `og:description`, `twitter:description`
- `robots` — `index, follow` или `noindex, nofollow`
- `landingJsonLd?: true` — только у `/`: полный набор schema лендинга

Неизвестный pathname → `FALLBACK_PAGE_SEO` (имя сайта + дефолтное description, indexable).

### Какие страницы индексируем

| Path | Индекс | Зачем |
|------|--------|--------|
| `/` | да | Главный посадочный |
| `/widgets/stats` | да | Виджет статистики |
| `/widgets/match-result` | да | Оверлей итога матча |
| `/widgets/twitch-commands` | да | Команды чата |
| `/stats` | **нет** | Embed для OBS |
| `/matchResult` | **нет** | Embed для OBS |
| `/admin`, `/admin/errors` | **нет** | Служебное |

Дублирование защиты:

1. `meta robots: noindex, nofollow` через `applyPageSeo`
2. `Disallow` в `client/public/robots.txt` для тех же путей

`robots.txt` не заменяет `noindex`: Disallow лишь намекает краулеру не ходить; meta закрывает страницу, если её всё же открыли по ссылке.

## Логика `applyPageSeo`

На каждый `pathname`:

1. Берёт конфиг из `PAGE_SEO_BY_PATH`.
2. Считает origin через `getSiteOrigin()` (см. ниже).
3. Ставит `document.title`.
4. Upsert meta: `description`, `robots`, OG (`og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:url`), Twitter.
5. Upsert / удаление `link[rel=canonical]` (`origin + path`; для `/` → `origin/`).
6. JSON-LD:
   - `landingJsonLd` → `upsertLandingJsonLd()` (software + FAQ + HowTo);
   - иначе снимает FAQ/HowTo (`removeLandingPageJsonLd`);
   - если страница **не** `noindex` — обновляет только `SoftwareApplication` (с `url` origin).

Meta-теги **не дублируются**: поиск по `name`/`property`, при отсутствии — создание, иначе обновление `content`.

ID script-тегов JSON-LD (стабильные, можно править в DevTools):

- `seo-jsonld-software` — также заранее лежит в `index.html`
- `seo-jsonld-faq`
- `seo-jsonld-howto`

## Origin: `VITE_SITE_URL`

`getSiteOrigin()`:

1. `import.meta.env.VITE_SITE_URL` (без хвостового `/`), если задан;
2. иначе `window.location.origin` в браузере;
3. иначе `''` (canonical/og:url не ставятся).

В проде на Vercel (**client / faceit-web**) обязательно:

```env
VITE_SITE_URL=https://DOMAIN.com
```

Переменная **build-time** (Vite): после смены нужен redeploy клиента.  
Должна совпадать с публичным доменом сайта (как `CLIENT_URL` на API, но с префиксом `VITE_` для клиента).

Локально можно не задавать — подставится `http://localhost:5173`.

См. также корневой `.env.example`.

## Статический baseline: `index.html`

Должен отражать SEO **главной**:

- `lang="ru"`
- title / description / keywords
- `robots: index, follow`
- Open Graph + Twitter (без обязательного `og:image` пока нет ассета 1200×630)
- `<script id="seo-jsonld-software" type="application/ld+json">` — черновик `SoftwareApplication` (без `url`; URL допишет клиент)

При смене текстов главной обновляй **и** `site.ts` / `pageSeo.ts`, **и** `index.html`, иначе бот без JS увидит устаревшее.

## Контент лендинга

### Hero

`landing-page-hero`: H1 и лид с ключами (FACEIT, OBS, Browser Source, ELO, CS2).

### HowTo

- Данные: `landingHowTo.ts`
- UI: `pages/landing-page/landing-page-howto/`
- Schema: `HowTo` + `HowToStep` в `landingJsonLd.ts`

### FAQ

- Данные: `landingFaq.ts`
- UI: `pages/landing-page/landing-page-faq/`
- Schema: `FAQPage` в `landingJsonLd.ts`

Порядок на `/`: Hero → Showcase виджетов → HowTo → FAQ → Footer (disclaimer «не аффилированы с FACEIT Ltd.»).

## Как добавить новую публичную страницу

1. Добавить роут в `app-routes.tsx`.
2. Добавить запись в `PAGE_SEO_BY_PATH` (title, description, `robots: index, follow`).
3. Сделать осмысленный H1 на странице (ключи в тексте, не только в meta).
4. Если страница служебная/embed — `noindex` + строка в `robots.txt`.

## Как поменять тексты FAQ / HowTo

1. Править только `landingFaq.ts` / `landingHowTo.ts`.
2. UI и JSON-LD подтянутся сами.
3. Не копируй ответы вручную во второй файл — будет рассинхрон со schema.

## `robots.txt`

Файл: `client/public/robots.txt` (отдаётся как статика с корня сайта).

Сейчас:

```txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/errors
Disallow: /stats
Disallow: /matchResult
```

Sitemap пока **не** заведён: в sitemap нужны **абсолютные** URL. Когда домен стабилен — добавить `sitemap.xml` (лучше генерация на билде с `VITE_SITE_URL`) и строку `Sitemap: https://DOMAIN.com/sitemap.xml`.

## Проверка

1. Открой `/`, `/widgets/stats` и т.д.
2. DevTools → Elements → `<head>`: title, description, robots, canonical, og:*, JSON-LD.
3. На `/stats` / `/admin` — `noindex, nofollow`, без FAQ/HowTo schema.
4. [Google Rich Results Test](https://search.google.com/test/rich-results) / [Schema Markup Validator](https://validator.schema.org/) по URL прода.
5. View-Source главной: в сыром HTML видны дефолты из `index.html`.

## Что ещё не сделано (осознанно)

- Prerender / SSR лендинга и ключевых `/widgets/*`
- `hreflang` (сайт пока один язык — RU)
- Отдельный EN-лендинг

## Sitemap и OG-image

- `client/public/sitemap.xml` — абсолютные URL `https://faceit-widgets.tonyx.ru/...` (только indexable-страницы).
- `client/public/robots.txt` — строка `Sitemap: https://faceit-widgets.tonyx.ru/sitemap.xml`.
- `client/public/og-image.png` — превью для шаринга; в `index.html` и через `applyPageSeo` (`og:image` / `twitter:image`).

После деплоя добавь sitemap в:
- Google Search Console → Индексирование → Файлы Sitemap
- Яндекс.Вебмастер → Индексирование → Файлы Sitemap  
URL: `https://faceit-widgets.tonyx.ru/sitemap.xml`
