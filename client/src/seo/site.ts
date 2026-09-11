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
