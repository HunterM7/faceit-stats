import { useCallback, useEffect, useRef, useState } from 'react';
import './stats-widget-page-content-guide-lightbox-dialog.scss';

const LIGHTBOX_MIN_SCALE = 1;
const LIGHTBOX_MAX_SCALE = 4;

export type StatsWidgetPageContentGuideLightboxDialogImage = {
  /** URL изображения. */
  src: string;
  /** Альтернативный текст изображения. */
  alt: string;
};

export type StatsWidgetPageContentGuideLightboxDialogProps = {
  /** Изображение для отображения в лайтбоксе. */
  image: StatsWidgetPageContentGuideLightboxDialogImage;
  /** Вызывается при закрытии лайтбокса. */
  onClose: () => void;
};

function clampLightboxScale(value: number): number {
  return Math.min(LIGHTBOX_MAX_SCALE, Math.max(LIGHTBOX_MIN_SCALE, value));
}

export function StatsWidgetPageContentGuideLightboxDialog(props: StatsWidgetPageContentGuideLightboxDialogProps) {
  const { image, onClose } = props;
  const [ scale, setScale ] = useState(LIGHTBOX_MIN_SCALE);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setScale(LIGHTBOX_MIN_SCALE);
    onClose();
  }, [ onClose ]);

  useEffect(() => {
    const rootNode = rootRef.current;
    if (!rootNode) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = -event.deltaY * 0.0015;
      setScale((currentScale) => clampLightboxScale(currentScale + delta));
    };

    rootNode.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      rootNode.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className='stats-widget-page-content-guide-lightbox-dialog'
      role='dialog'
      aria-modal='true'
      aria-label={image.alt}
      onClick={handleClose}
    >
      <button
        type='button'
        className='stats-widget-page-content-guide-lightbox-dialog__close'
        aria-label='Закрыть'
        onClick={handleClose}
      />
      <div className='stats-widget-page-content-guide-lightbox-dialog__stage'>
        <img
          className='stats-widget-page-content-guide-lightbox-dialog__img'
          src={image.src}
          alt={image.alt}
          style={{ transform: `scale(${scale})` }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      </div>
    </div>
  );
}
