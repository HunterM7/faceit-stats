import { classNames } from '@/utils/classNames';
import './landing-page-hero.scss';

type Props = {
  className?: string | undefined;
};

export function LandingPageHero(props: Props) {
  const { className } = props;

  return (
    <section className={classNames('landing-page-hero', className)}>
      <p className='landing-page-hero__badge'>ДЛЯ OBS / BROWSER SOURCE</p>
      <h1 className='landing-page-hero__title'>FACEIT виджеты на стрим</h1>
      <p className='landing-page-hero__subtitle'>
        Отдельные страницы каждого виджета с понятными настройками, инструкциями для OBS и быстрым копированием ссылок.
      </p>
    </section>
  );
}
