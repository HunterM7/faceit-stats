import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { OverlayWidgetPageContent } from './overlay-widget-page-content/overlay-widget-page-content';
import './overlay-widget-page.scss';

export function OverlayWidgetPage() {
  return (
    <main className='overlay-widget-page'>
      <Header className='overlay-widget-page__header'/>
      <OverlayWidgetPageContent/>
      <Footer className='overlay-widget-page__footer'/>
    </main>
  );
}
