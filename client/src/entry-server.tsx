import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { LandingPage } from '@pages/landing-page/landing-page';
import { OverlayWidgetPage } from '@pages/overlay-widget-page/overlay-widget-page';
import { StatsWidgetPage } from '@pages/stats-widget-page/stats-widget-page';
import { TwitchCommandsPage } from '@pages/twitch-commands-page/twitch-commands-page';
import { PAGE_SEO_BY_PATH } from '@/seo/pageSeo';
import { getSiteOrigin } from '@/seo/site';

const PRERENDER_PAGES = {
  '/': { Page: LandingPage, entry: 'src/pages/landing-page/landing-page.tsx' },
  '/widgets/stats': { Page: StatsWidgetPage, entry: 'src/pages/stats-widget-page/stats-widget-page.tsx' },
  '/widgets/match-result': { Page: OverlayWidgetPage, entry: 'src/pages/overlay-widget-page/overlay-widget-page.tsx' },
  '/widgets/twitch-commands': { Page: TwitchCommandsPage, entry: 'src/pages/twitch-commands-page/twitch-commands-page.tsx' },
} as const;

export const PRERENDER_PATHS = Object.keys(PRERENDER_PAGES) as Array<keyof typeof PRERENDER_PAGES>;

/** Ключ чанка в Vite `manifest.json` для CSS этой страницы. */
export function getPrerenderEntry(pathname: keyof typeof PRERENDER_PAGES): string {
  return PRERENDER_PAGES[pathname].entry;
}

/**
 * HTML индексной страницы для пререндера при сборке.
 * @param pathname маршрут из `PRERENDER_PATHS`
 */
export function render(pathname: keyof typeof PRERENDER_PAGES) {
  const { Page } = PRERENDER_PAGES[pathname];
  const seo = PAGE_SEO_BY_PATH[pathname];
  if (!seo) {
    throw new Error(`Нет SEO для ${pathname}`);
  }
  const origin = getSiteOrigin();
  return {
    html: renderToString(
      <StaticRouter location={pathname}>
        <Page/>
      </StaticRouter>,
    ),
    title: seo.title,
    description: seo.description,
    canonical: origin ? `${origin}${pathname === '/' ? '/' : pathname}` : '',
  };
}
