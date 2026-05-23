import { classNames } from '@/utils/classNames';
import './stats-widget-page-content-guide-step.scss';

export type Props = {
  /** Заголовок шага инструкции. */
  title: string;
  /** Описание шага инструкции. */
  text: string;
  /** Порядковый номер шага, отображается в кружке (начиная с 0). */
  index: number;
  /** Скриншот шага. Если не передан, шаг отображается без изображения. */
  image?: {
    /** URL скриншота. */
    src: string;
    /** Альтернативный текст скриншота. */
    alt: string;
  } | undefined;
  /** Вызывается при клике на скриншот. */
  onImageClick: (image: { src: string; alt: string }) => void;
};

export function StatsWidgetPageContentGuideStep(props: Props) {
  const { title, text, index, image, onImageClick } = props;

  return (
    <li className={classNames('stats-widget-page-content-guide-step', !image && 'stats-widget-page-content-guide-step--text-only')}>
      {image && (
        <figure className='stats-widget-page-content-guide-step__shot'>
          <button
            type='button'
            className='stats-widget-page-content-guide-step__shot-button'
            aria-label={`Увеличить: ${image.alt}`}
            onClick={() => {
              onImageClick(image);
            }}
          >
            <img
              className='stats-widget-page-content-guide-step__shot-img'
              src={image.src}
              alt={image.alt}
              loading='lazy'
              decoding='async'
            />
          </button>
        </figure>
      )}
      <div className='stats-widget-page-content-guide-step__body'>
        <span className='stats-widget-page-content-guide-step__num' aria-hidden='true'>{index + 1}</span>
        <div className='stats-widget-page-content-guide-step__copy'>
          <p className='stats-widget-page-content-guide-step__title'>{title}</p>
          <p className='stats-widget-page-content-guide-step__text'>{text}</p>
        </div>
      </div>
    </li>
  );
}
