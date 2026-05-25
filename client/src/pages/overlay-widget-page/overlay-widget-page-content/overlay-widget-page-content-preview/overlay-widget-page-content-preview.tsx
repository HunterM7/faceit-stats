import { WidgetOverlay } from '@widgets/widget-overlay/widget-overlay';
import { useOverlayTestMatchCycle } from '@widgets/widget-overlay/use-overlay-test-match-cycle';

type OverlayWidgetPageContentPreviewProps = {
  nickname: string;
};

export function OverlayWidgetPageContentPreview(props: OverlayWidgetPageContentPreviewProps) {
  const { nickname } = props;
  const hasNickname = nickname.trim().length > 0;
  const previewMatch = useOverlayTestMatchCycle(hasNickname);

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
          <WidgetOverlay match={previewMatch}/>
        </div>
      </div>
    </div>
  );
}
