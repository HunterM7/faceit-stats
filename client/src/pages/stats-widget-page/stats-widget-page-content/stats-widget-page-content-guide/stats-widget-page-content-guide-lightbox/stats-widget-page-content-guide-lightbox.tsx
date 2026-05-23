import { createPortal } from 'react-dom';
import { useCallback, useEffect } from 'react';
import {
  StatsWidgetPageContentGuideLightboxDialog,
  type StatsWidgetPageContentGuideLightboxDialogImage,
} from './stats-widget-page-content-guide-lightbox-dialog/stats-widget-page-content-guide-lightbox-dialog';

export type StatsWidgetPageContentGuideLightboxImage = StatsWidgetPageContentGuideLightboxDialogImage;

export type StatsWidgetPageContentGuideLightboxProps = {
  /** Изображение для просмотра в лайтбоксе. `null` — лайтбокс скрыт. */
  image: StatsWidgetPageContentGuideLightboxImage | null;
  /** Вызывается при закрытии лайтбокса. */
  onClose: () => void;
};

export function StatsWidgetPageContentGuideLightbox(props: StatsWidgetPageContentGuideLightboxProps) {
  const { image, onClose } = props;

  const closeLightbox = useCallback(() => {
    onClose();
  }, [ onClose ]);

  useEffect(() => {
    if (!image) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ closeLightbox, image ]);

  if (!image) {
    return null;
  }

  return createPortal(
    <StatsWidgetPageContentGuideLightboxDialog
      key={image.src}
      image={image}
      onClose={closeLightbox}
    />,
    document.body,
  );
}
