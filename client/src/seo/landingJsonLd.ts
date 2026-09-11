import { LANDING_FAQ_ITEMS } from './landingFaq';
import { LANDING_HOWTO_DESCRIPTION, LANDING_HOWTO_NAME, LANDING_HOWTO_STEPS } from './landingHowTo';
import { DEFAULT_PAGE_DESCRIPTION, SITE_NAME, getSiteOrigin } from './site';

const SOFTWARE_JSON_LD_ID = 'seo-jsonld-software';
const FAQ_JSON_LD_ID = 'seo-jsonld-faq';
const HOWTO_JSON_LD_ID = 'seo-jsonld-howto';
const WEBSITE_JSON_LD_ID = 'seo-jsonld-website';
const NAV_JSON_LD_ID = 'seo-jsonld-navigation';

interface SiteNavItem {
  name: string;
  path: string;
}

const SITE_NAV_ITEMS: SiteNavItem[] = [
  { name: 'Виджет статистики Faceit', path: '/widgets/stats' },
  { name: 'Виджет с результатами матча Faceit', path: '/widgets/match-result' },
  { name: 'Команды Faceit для Twitch', path: '/widgets/twitch-commands' },
];

export function buildSoftwareApplicationJsonLd(siteOrigin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    alternateName: [ 'Виджет Faceit для OBS', 'Фейсит виджет', 'Виджет с результатами матча Faceit' ],
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Виджет Faceit для OBS',
      'Фейсит виджет для стрима',
      'Статистика ELO Faceit',
      'Виджет с результатами матча после игры',
      'Команды Faceit для Twitch',
    ],
    description: DEFAULT_PAGE_DESCRIPTION,
    url: siteOrigin || undefined,
  };
}

export function buildWebSiteJsonLd(siteOrigin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: [ 'Виджет Faceit для OBS', 'Фейсит виджет', 'Виджет с результатами матча Faceit' ],
    url: siteOrigin || undefined,
    description: DEFAULT_PAGE_DESCRIPTION,
    inLanguage: 'ru-RU',
  };
}

export function buildSiteNavigationJsonLd(siteOrigin: string) {
  if (!siteOrigin) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: SITE_NAV_ITEMS.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      url: `${siteOrigin}${item.path}`,
    })),
  };
}

export function buildFaqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildHowToJsonLd(siteOrigin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: LANDING_HOWTO_NAME,
    description: LANDING_HOWTO_DESCRIPTION,
    totalTime: 'PT3M',
    url: siteOrigin || undefined,
    step: LANDING_HOWTO_STEPS.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function upsertLandingJsonLd(): void {
  const origin = getSiteOrigin();
  setJsonLdScript(SOFTWARE_JSON_LD_ID, buildSoftwareApplicationJsonLd(origin));
  setJsonLdScript(WEBSITE_JSON_LD_ID, buildWebSiteJsonLd(origin));
  const navigation = buildSiteNavigationJsonLd(origin);
  if (navigation) {
    setJsonLdScript(NAV_JSON_LD_ID, navigation);
  } else {
    removeElementById(NAV_JSON_LD_ID);
  }
  setJsonLdScript(FAQ_JSON_LD_ID, buildFaqPageJsonLd());
  setJsonLdScript(HOWTO_JSON_LD_ID, buildHowToJsonLd(origin));
}

/** Оставляет SoftwareApplication / WebSite, убирает FAQ / HowTo / навигацию лендинга. */
export function removeLandingPageJsonLd(): void {
  removeElementById(FAQ_JSON_LD_ID);
  removeElementById(HOWTO_JSON_LD_ID);
  removeElementById(NAV_JSON_LD_ID);
}

/** Обновляет карточку приложения и сайт (для indexable-страниц). */
export function upsertSoftwareJsonLd(): void {
  const origin = getSiteOrigin();
  setJsonLdScript(SOFTWARE_JSON_LD_ID, buildSoftwareApplicationJsonLd(origin));
  setJsonLdScript(WEBSITE_JSON_LD_ID, buildWebSiteJsonLd(origin));
}

function setJsonLdScript(id: string, data: object): void {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeElementById(id: string): void {
  document.getElementById(id)?.remove();
}
