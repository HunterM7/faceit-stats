import { classNames } from '@utils/classNames';
import type { BoolSetting } from '@utils/widget-url';
import { Section } from '@/components/section/section';
import { Button, ButtonVariant } from '@/ui/button/button';
import { LinkButton } from '@/ui/link-button/link-button';
import { useOverlayWidgetPageLink } from './use-overlay-widget-page-link';
import './overlay-widget-page-link-section.scss';

export type OverlayWidgetPageLinkSectionProps = {
  /** Никнейм игрока. */
  nickname: string;
  /** Тестовый режим в ссылке на виджет. */
  testMode: BoolSetting;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function OverlayWidgetPageLinkSection(props: OverlayWidgetPageLinkSectionProps) {
  const { nickname, testMode, className } = props;

  const { widgetUrl, canBuild, copy } = useOverlayWidgetPageLink({ nickname, testMode });

  return (
    <Section title='Ссылка на виджет' className={classNames('overlay-widget-page-link-section', className)}>
      <p className='overlay-widget-page-link-section__hint'>Используй эту ссылку в OBS или других программах для стриминга.</p>
      <div className='overlay-widget-page-link-section__link-row'>
        <input
          className='overlay-widget-page-link-section__link-url'
          type='text'
          readOnly
          value={widgetUrl}
          placeholder='Укажи свой FACEIT ник, чтобы сгенерировать ссылку'
        />
        <Button variant={ButtonVariant.Primary} onClick={copy} disabled={!canBuild}>
          Копировать URL
        </Button>
        <LinkButton href={widgetUrl} target='_blank' disabled={!canBuild}>
          Открыть виджет
        </LinkButton>
      </div>
    </Section>
  );
}
