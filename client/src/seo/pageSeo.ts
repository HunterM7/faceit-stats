import { DEFAULT_PAGE_DESCRIPTION, DEFAULT_PAGE_TITLE, SITE_NAME } from './site';

export interface PageSeo {
  /** `<title>` и `og:title`. */
  title: string;
  /** Meta description и `og:description`. */
  description: string;
  /** Значение `meta robots`. */
  robots: string;
  /** Подключать JSON-LD лендинга (FAQ / HowTo / приложение / навигация). */
  landingJsonLd?: boolean | undefined;
}

const INDEXABLE = 'index, follow';
const NOINDEX = 'noindex, nofollow';

export const PAGE_SEO_BY_PATH: Record<string, PageSeo> = {
  '/': {
    title: DEFAULT_PAGE_TITLE,
    description: DEFAULT_PAGE_DESCRIPTION,
    robots: INDEXABLE,
    landingJsonLd: true,
  },
  '/widgets/stats': {
    title: `Виджет статистики Faceit для OBS | ${SITE_NAME}`,
    description:
      'FACEIT Widgets — фейсит виджет статистики для OBS: ELO, уровень Faceit и последние матчи CS2 на стриме. Скопируй ссылку и добавь в OBS — без регистрации.',
    robots: INDEXABLE,
  },
  '/widgets/match-result': {
    title: `Виджет с результатами матча Faceit для OBS | ${SITE_NAME}`,
    description:
      'FACEIT Widgets — виджет с результатами матча Faceit после окончания игры: победа или поражение, изменение ELO и уровень. Вставь ссылку в OBS.',
    robots: INDEXABLE,
  },
  '/widgets/twitch-commands': {
    title: `Команды Faceit для Twitch | ${SITE_NAME}`,
    description:
      'FACEIT Widgets — команды фейсит виджета для Twitch: ELO и статистика Faceit в чате. Готовый код для Nightbot и StreamElements.',
    robots: INDEXABLE,
  },
  '/stats': {
    title: `${SITE_NAME} — виджет статистики`,
    description: DEFAULT_PAGE_DESCRIPTION,
    robots: NOINDEX,
  },
  '/matchResult': {
    title: `${SITE_NAME} — итог матча`,
    description: DEFAULT_PAGE_DESCRIPTION,
    robots: NOINDEX,
  },
  '/admin': {
    title: `${SITE_NAME} — админка`,
    description: DEFAULT_PAGE_DESCRIPTION,
    robots: NOINDEX,
  },
  '/admin/errors': {
    title: `${SITE_NAME} — ошибки`,
    description: DEFAULT_PAGE_DESCRIPTION,
    robots: NOINDEX,
  },
};

export const FALLBACK_PAGE_SEO: PageSeo = {
  title: SITE_NAME,
  description: DEFAULT_PAGE_DESCRIPTION,
  robots: INDEXABLE,
};
