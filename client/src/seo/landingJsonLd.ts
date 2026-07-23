import { LANDING_FAQ_ITEMS } from './landingFaq';
import { LANDING_HOWTO_DESCRIPTION, LANDING_HOWTO_NAME, LANDING_HOWTO_STEPS } from './landingHowTo';
import { DEFAULT_PAGE_DESCRIPTION, SITE_NAME, getSiteOrigin } from './site';

const SOFTWARE_JSON_LD_ID = 'seo-jsonld-software';
const FAQ_JSON_LD_ID = 'seo-jsonld-faq';
const HOWTO_JSON_LD_ID = 'seo-jsonld-howto';

export function buildSoftwareApplicationJsonLd(siteOrigin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: DEFAULT_PAGE_DESCRIPTION,
    url: siteOrigin || undefined,
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
  setJsonLdScript(FAQ_JSON_LD_ID, buildFaqPageJsonLd());
  setJsonLdScript(HOWTO_JSON_LD_ID, buildHowToJsonLd(origin));
}

/** Оставляет SoftwareApplication, убирает FAQ/HowTo лендинга. */
export function removeLandingPageJsonLd(): void {
  removeElementById(FAQ_JSON_LD_ID);
  removeElementById(HOWTO_JSON_LD_ID);
}

/** Обновляет только карточку приложения (для внутренних indexable-страниц). */
export function upsertSoftwareJsonLd(): void {
  setJsonLdScript(SOFTWARE_JSON_LD_ID, buildSoftwareApplicationJsonLd(getSiteOrigin()));
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
