/** Публичное имя продукта в title / Open Graph. */
export const SITE_NAME = 'FACEIT Widgets';

/** Title главной по умолчанию (также в `index.html` для первого paint и ботов). */
export const DEFAULT_PAGE_TITLE = 'FACEIT виджеты для OBS — ELO и статистика CS2 на стрим';

/** Description главной по умолчанию. */
export const DEFAULT_PAGE_DESCRIPTION =
  'Бесплатные виджеты FACEIT для OBS и Streamlabs: ELO, уровень, статистика за сегодня и last 30, итог матча. Browser Source по нику — без регистрации.';

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
