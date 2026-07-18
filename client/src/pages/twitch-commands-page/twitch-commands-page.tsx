import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { TwitchCommandsPageContent } from './twitch-commands-page-content/twitch-commands-page-content';
import './twitch-commands-page.scss';

export function TwitchCommandsPage() {
  return (
    <main className='twitch-commands-page'>
      <Header className='twitch-commands-page__header'/>
      <TwitchCommandsPageContent/>
      <Footer className='twitch-commands-page__footer'/>
    </main>
  );
}
