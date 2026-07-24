/** Публичное имя продукта в title / Open Graph. */
export const SITE_NAME = 'FACEIT Widgets';

/** Title главной по умолчанию (также в `index.html` для первого paint и ботов). */
export const DEFAULT_PAGE_TITLE = 'FACEIT Widgets — виджеты статистики для OBS';

/** Description главной по умолчанию (сниппет в выдаче). */
export const DEFAULT_PAGE_DESCRIPTION =
  'Бесплатные виджеты FACEIT для стрима: статистика, ELO и итог матча. Добавь в OBS как Browser Source — без регистрации.';

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
