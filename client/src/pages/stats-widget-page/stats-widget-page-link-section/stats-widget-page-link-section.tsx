import { classNames } from '@utils/classNames';
import type { StatsRatingQuery } from '@requests/stats';
import { Button, ButtonVariant } from '@/ui/button/button';
import { LinkButton } from '@/ui/link-button/link-button';
import { useStatsWidgetPageLink } from './use-stats-widget-page-link';
import './stats-widget-page-link-section.scss';

export type StatsWidgetPageLinkSectionProps = {
  /** Никнейм игрока. */
  nickname: string;
  /** Прозрачность фона виджета в процентах. */
  backgroundOpacity?: number | undefined;
  /** Скругление углов виджета в пикселях. */
  borderRadius?: number | undefined;
  /** Режим отображения рейтинга в виджете. */
  ratingMode: StatsRatingQuery;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function StatsWidgetPageLinkSection(props: StatsWidgetPageLinkSectionProps) {
  const { nickname, backgroundOpacity, borderRadius, ratingMode, className } = props;

  const { widgetUrl, canBuild, copy } = useStatsWidgetPageLink({ nickname, backgroundOpacity, borderRadius, ratingMode });

  return (
    <article className={classNames('stats-widget-page-link-section', className)}>
      <p className='stats-widget-page-link-section__title'>Ссылка на виджет</p>
      <p className='stats-widget-page-link-section__hint'>Используй эту ссылку в OBS или других программах для стриминга</p>
      <div className='stats-widget-page-link-section__link-row'>
        <input
          className='stats-widget-page-link-section__link-url'
          type='text'
          readOnly
          value={widgetUrl}
          placeholder='Укажи ник, чтобы сгенерировать ссылку'
          aria-label='Ссылка на виджет статистики'
        />
        <Button variant={ButtonVariant.Primary} onClick={copy} disabled={!canBuild}>
          Копировать URL
        </Button>
        <LinkButton href={widgetUrl} target='_blank' disabled={!canBuild}>
          Открыть виджет
        </LinkButton>
      </div>
    </article>
  );
}
