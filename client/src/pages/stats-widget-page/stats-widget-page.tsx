import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { StatsWidgetPageContent } from './stats-widget-page-content/stats-widget-page-content';
import './stats-widget-page.scss';

export function StatsWidgetPage() {
  return (
    <main className='stats-widget-page'>
      <Header className='stats-widget-page__header'/>
      <StatsWidgetPageContent/>
      <Footer className='stats-widget-page__footer'/>
    </main>
  );
}
