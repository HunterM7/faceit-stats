import { classNames } from '@/utils/classNames';
import './stats-widget-page-content-hero-steps.scss';

const STEPS = [
  'Укажи свой FACEIT ник в параметрах справа',
  'Настрой прозрачность, скругление и рейтинг',
  'Скопируй ссылку на виджет',
] as const;

export type StatsWidgetPageContentHeroStepsProps = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function StatsWidgetPageContentHeroSteps(props: StatsWidgetPageContentHeroStepsProps) {
  const { className } = props;

  return (
    <ol className={classNames('stats-widget-page-content-hero-steps', className)}>
      {STEPS.map((text, index) => (
        <li key={text} className='stats-widget-page-content-hero-steps__step'>
          <span className='stats-widget-page-content-hero-steps__step-num'>{index + 1}</span>
          <span className='stats-widget-page-content-hero-steps__step-text'>{text}</span>
        </li>
      ))}
    </ol>
  );
}
