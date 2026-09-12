import { type ComponentRef, useEffect, useRef } from 'react';
import { WidgetOverlay } from '@widgets/widget-overlay/widget-overlay';
import { useOverlayTestMatchCycle } from '@widgets/widget-overlay/use-overlay-test-match-cycle';

interface OverlayWidgetPageContentPreviewProps {
  /** Ник FACEIT — без него превью не показывается. */
  nickname: string;
  /** Показывать фоновые частицы в превью. */
  particles: boolean;
}

export function OverlayWidgetPageContentPreview(props: OverlayWidgetPageContentPreviewProps) {
  const { nickname, particles } = props;

  const hasNickname = nickname.trim().length > 0;
  const previewCycle = useOverlayTestMatchCycle(hasNickname);
  const widgetOverlayRef = useRef<ComponentRef<typeof WidgetOverlay>>(null);

  useEffect(() => {
    if (!previewCycle) {
      return;
    }

    if (!previewCycle.match) {
      widgetOverlayRef.current?.showMatchResult({ result: previewCycle.result });
      return;
    }

    widgetOverlayRef.current?.showMatchResult({
      previous: previewCycle.previousMatch
        && typeof previewCycle.previousMatch.elo === 'number'
        && typeof previewCycle.previousMatch.skillLevel === 'number'
        ? { elo: previewCycle.previousMatch.elo, skillLevel: previewCycle.previousMatch.skillLevel }
        : undefined,
      current: typeof previewCycle.match.elo === 'number' && typeof previewCycle.match.skillLevel === 'number'
        ? { elo: previewCycle.match.elo, skillLevel: previewCycle.match.skillLevel }
        : undefined,
      result: previewCycle.match.result,
    });
  }, [ previewCycle ]);

  if (!hasNickname) {
    return (
      <div className='overlay-widget-page-content__preview'>
        <p className='overlay-widget-page-content__preview-placeholder'>
          Укажи свой FACEIT ник
        </p>
      </div>
    );
  }

  return (
    <div className='overlay-widget-page-content__preview'>
      <div className='overlay-widget-page-content__preview-stage'>
        <div className='overlay-widget-page-content__preview-card'>
          <WidgetOverlay ref={widgetOverlayRef} particles={particles}/>
        </div>
      </div>
    </div>
  );
}
