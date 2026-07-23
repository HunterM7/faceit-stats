import { DEFAULT_PAGE_DESCRIPTION, DEFAULT_PAGE_TITLE, SITE_NAME } from './site';

export interface PageSeo {
  /** `<title>` и `og:title`. */
  title: string;
  /** Meta description и `og:description`. */
  description: string;
  /** Значение `meta robots`. */
  robots: string;
  /** Подключать JSON-LD лендинга (FAQ / HowTo / приложение). */
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
    title: 'Виджет статистики FACEIT для OBS — ELO, K/D, last 30',
    description:
      'Собери виджет статистики FACEIT для стрима: ELO, уровень, wins/losses за сегодня и аналитика последних 30 матчей. Скопируй ссылку и добавь Browser Source в OBS.',
    robots: INDEXABLE,
  },
  '/widgets/match-result': {
    title: 'Виджет итога матча FACEIT для OBS — ELO и уровень',
    description:
      'Оверлей результата матча FACEIT для OBS: победа или поражение, изменение ELO и уровень. Автообновление после игры — вставь ссылку как Browser Source.',
    robots: INDEXABLE,
  },
  '/widgets/twitch-commands': {
    title: 'Команды FACEIT для Twitch-чата — ELO и статистика',
    description:
      'Готовые команды для Nightbot и StreamElements: ELO, уровень и подробная статистика FACEIT в чате Twitch. Скопируй код и вставь в чат-бота.',
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
