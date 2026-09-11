/** Публичное имя продукта в title / Open Graph. */
export const SITE_NAME = 'FACEIT Widgets';

/** Title главной по умолчанию (также в `index.html` для первого paint и ботов). */
export const DEFAULT_PAGE_TITLE = `Виджет Faceit для OBS — статистика и результаты матча | ${SITE_NAME}`;

/** Description главной по умолчанию (сниппет в выдаче). */
export const DEFAULT_PAGE_DESCRIPTION =
  'FACEIT Widgets — бесплатные виджеты Faceit для OBS: статистика, ELO и результаты матча после окончания игры. Добавь в OBS — без регистрации.';

/**
 * Базовый URL сайта для canonical / Open Graph.
 * В проде задайте `VITE_SITE_URL=https://ваш-домен.com`.
 */
export function getSiteOrigin(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

const CANONICAL_TRAILING_SLASH_PATHS = new Set([
  '/widgets/stats',
  '/widgets/match-result',
  '/widgets/twitch-commands',
]);

/**
 * Pathname для карты SEO: без завершающего `/`, кроме корня.
 * Nginx отдаёт `/widgets/stats/` — ключи в `PAGE_SEO_BY_PATH` без слэша.
 */
export function normalizeSeoPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Путь канонического URL: тот, что отвечает 200 (для виджетов — со слэшем, как после 301 nginx).
 */
export function getCanonicalPath(pathname: string): string {
  const normalized = normalizeSeoPathname(pathname);
  if (normalized === '/') {
    return '/';
  }
  if (CANONICAL_TRAILING_SLASH_PATHS.has(normalized)) {
    return `${normalized}/`;
  }
  return normalized;
}

/**
 * Абсолютный canonical / og:url или пустая строка, если origin неизвестен.
 */
export function getCanonicalUrl(pathname: string): string {
  const origin = getSiteOrigin();
  if (!origin) {
    return '';
  }
  return `${origin}${getCanonicalPath(pathname)}`;
}
