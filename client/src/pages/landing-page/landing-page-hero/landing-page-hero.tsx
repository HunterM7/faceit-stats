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
      <h1 className='landing-page-hero__title'>Виджеты с FACEIT-статистикой для OBS</h1>
      <p className='landing-page-hero__subtitle'>
        Статистика, ELO и итог матча на стриме. Настрой виджет, скопируй ссылку и добавь в OBS —
        без регистрации.
      </p>
    </section>
  );
}
