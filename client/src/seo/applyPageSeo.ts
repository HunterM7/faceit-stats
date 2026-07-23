import { removeLandingPageJsonLd, upsertLandingJsonLd, upsertSoftwareJsonLd } from './landingJsonLd';
import { FALLBACK_PAGE_SEO, PAGE_SEO_BY_PATH, type PageSeo } from './pageSeo';
import { SITE_NAME, getSiteOrigin } from './site';

/**
 * Применяет SEO-метаданные страницы к `document.head`
 * (title, description, robots, canonical, Open Graph, Twitter).
 */
export function applyPageSeo(pathname: string): void {
  const seo = PAGE_SEO_BY_PATH[pathname] ?? FALLBACK_PAGE_SEO;
  const origin = getSiteOrigin();
  const canonicalUrl = origin ? `${origin}${pathname === '/' ? '/' : pathname}` : '';

  document.title = seo.title;

  setMetaByName('description', seo.description);
  setMetaByName('robots', seo.robots);
  setLinkCanonical(canonicalUrl);

  setMetaByProperty('og:type', 'website');
  setMetaByProperty('og:site_name', SITE_NAME);
  setMetaByProperty('og:locale', 'ru_RU');
  setMetaByProperty('og:title', seo.title);
  setMetaByProperty('og:description', seo.description);
  if (canonicalUrl) {
    setMetaByProperty('og:url', canonicalUrl);
  }

  setMetaByName('twitter:card', 'summary_large_image');
  setMetaByName('twitter:title', seo.title);
  setMetaByName('twitter:description', seo.description);

  if (seo.landingJsonLd) {
    upsertLandingJsonLd();
  } else {
    removeLandingPageJsonLd();
    if (!seo.robots.includes('noindex')) {
      upsertSoftwareJsonLd();
    }
  }
}

export function getPageSeo(pathname: string): PageSeo {
  return PAGE_SEO_BY_PATH[pathname] ?? FALLBACK_PAGE_SEO;
}

function setMetaByName(name: string, content: string): void {
  setMeta('name', name, content);
}

function setMetaByProperty(property: string, content: string): void {
  setMeta('property', property, content);
}

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${cssEscape(key)}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkCanonical(href: string): void {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}
