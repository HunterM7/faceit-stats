import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { LandingPageHero } from './landing-page-hero/landing-page-hero';
import { LandingPageShowcase } from './landing-page-showcase/landing-page-showcase';
import './landing-page.scss';

export function LandingPage() {
  return (
    <main className='landing-page'>
      <Header/>

      <div className='landing-page__content'>
        <LandingPageHero/>
        <LandingPageShowcase/>
      </div>

      <Footer className='landing-page__footer'/>
    </main>
  );
}
