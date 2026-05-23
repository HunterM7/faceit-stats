import { classNames } from '@/utils/classNames';
import './stats-widget-page-content-hero-steps.scss';



export type StatsWidgetPageContentHeroStepsProps = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function StatsWidgetPageContentHeroSteps(props: StatsWidgetPageContentHeroStepsProps) {
  const { className } = props;

  const STEPS = [
    'Укажите ник FACEIT в параметрах справа',
    'Настройте прозрачность, скругление и рейтинг',
    'Скопируйте ссылку и вставьте в Browser Source OBS',
  ];

  return (
    <ol className={classNames('stats-widget-page-content-hero-steps', className)} aria-label='Как подключить виджет'>
      {STEPS.map((text, index) => (
        <li key={text} className='stats-widget-page-content-hero-steps__step'>
          <span className='stats-widget-page-content-hero-steps__step-num' aria-hidden='true'>{index + 1}</span>
          <span className='stats-widget-page-content-hero-steps__step-text'>{text}</span>
        </li>
      ))}
    </ol>
  );
}
