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
    title: 'Виджет статистики FACEIT — для OBS и стрима',
    description:
      'Покажи на стриме ELO, уровень и статистику FACEIT. Скопируй ссылку и добавь Browser Source в OBS — без регистрации.',
    robots: INDEXABLE,
  },
  '/widgets/match-result': {
    title: 'Итог матча FACEIT — оверлей для OBS',
    description:
      'Оверлей после матча: победа или поражение, изменение ELO и уровень. Вставь ссылку в OBS как Browser Source.',
    robots: INDEXABLE,
  },
  '/widgets/twitch-commands': {
    title: 'Команды FACEIT для Twitch — ELO в чате',
    description:
      'Готовый код для Nightbot и StreamElements: ELO и статистика FACEIT в чате Twitch. Скопируй и вставь в бота.',
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
