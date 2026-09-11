import { classNames } from '@/utils/classNames';
import './landing-page-hero.scss';

type Props = {
  className?: string | undefined;
};

export function LandingPageHero(props: Props) {
  const { className } = props;

  return (
    <section className={classNames('landing-page-hero', className)}>
      <p className='landing-page-hero__badge'>CS2 · OBS · STREAMLABS</p>
      <h1 className='landing-page-hero__title'>Виджет Faceit для OBS</h1>
      <p className='landing-page-hero__brand'>FACEIT Widgets</p>
      <p className='landing-page-hero__subtitle'>
        Бесплатный фейсит виджет для стрима CS2: статистика и ELO на экране плюс виджет
        с результатами матча после окончания игры. Добавь в OBS или Streamlabs — без регистрации.
      </p>
    </section>
  );
}
