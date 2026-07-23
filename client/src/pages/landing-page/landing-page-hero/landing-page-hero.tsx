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
      <h1 className='landing-page-hero__title'>FACEIT виджеты для OBS и стрима</h1>
      <p className='landing-page-hero__subtitle'>
        Бесплатные Browser Source виджеты: ELO, уровень, статистика CS2 и итог матча.
        Настрой на сайте, скопируй ссылку и добавь в OBS или Streamlabs — без регистрации.
      </p>
    </section>
  );
}
