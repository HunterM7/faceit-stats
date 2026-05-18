import { AppHeader } from '@components/app-header/app-header';
import { Footer } from '@components/footer/footer';
import { StatsWidgetPageContent } from './stats-widget-page-content/stats-widget-page-content';
import './stats-widget-page.scss';

export function StatsWidgetPage() {
  return (
    <main className='stats-widget-page'>
      <AppHeader className='stats-widget-page__header'/>
      <StatsWidgetPageContent/>
      <Footer className='stats-widget-page__footer'/>
    </main>
  );
}
