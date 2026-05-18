import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { classNames } from '@/utils/classNames';
import cs2Bg from '@images/cs2-bg.jpg';
import './landing-page-showcase.scss';

type Props = {
  className?: string | undefined;
};

const widgetBackgroundStyle = { '--widget-bg': `url(${cs2Bg})` } as CSSProperties;

export function LandingPageShowcase(props: Props) {
  const { className } = props;

  return (
    <section className={classNames('landing-page-showcase', className)} id='widgets'>
      <div className='landing-page-showcase__inner'>
        <article className='landing-page-showcase__widget-block' style={widgetBackgroundStyle}>
          <div className='landing-page-showcase__widget-head'>
            <p className='landing-page-showcase__widget-headline'>Твоя статистика</p>
          </div>
          <Link to='/widgets/stats' className='landing-page-showcase__widget-cta'>Создать виджет</Link>
        </article>

        <article className='landing-page-showcase__widget-block' style={widgetBackgroundStyle}>
          <div className='landing-page-showcase__widget-head'>
            <p className='landing-page-showcase__widget-headline'>Итог матча</p>
          </div>
          <Link to='/widgets/match-result' className='landing-page-showcase__widget-cta'>Создать виджет</Link>
        </article>
      </div>
    </section>
  );
}
