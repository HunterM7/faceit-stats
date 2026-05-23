import { useCallback, useState, type ComponentProps } from 'react';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import {
  StatsWidgetPageContentGuideLightbox,
  type StatsWidgetPageContentGuideLightboxImage,
} from './stats-widget-page-content-guide-lightbox/stats-widget-page-content-guide-lightbox';
import { StatsWidgetPageContentGuideStep } from './stats-widget-page-content-guide-step/stats-widget-page-content-guide-step';
import './stats-widget-page-content-guide.scss';

type GuideStep = Pick<ComponentProps<typeof StatsWidgetPageContentGuideStep>, 'title' | 'text' | 'image'>;

const STEPS: GuideStep[] = [
  {
    title: 'Скопируй ссылку на виджет',
    text: 'Нажми «Копировать URL» в блоке «Ссылка на виджет». В этом URL уже содержится твой ник и настройки оформления виджета.',
  },
  {
    title: 'Создай источник «Браузер» в OBS',
    text: 'В списке источников нажми «+» → «Добавить источник» и выбери «Браузер».',
    image: {
      src: '/images/obs-guide/step-2-browser-source.png',
      alt: 'Добавление источника «Браузер» в OBS',
    },
  },
  {
    title: 'Вставь скопированную ссылку',
    text: 'В свойствах источника вставь скопированную ссылку в поле «Ссылка» и нажми OK.',
    image: {
      src: '/images/obs-guide/step-3-paste-url.png',
      alt: 'Вставка ссылки в свойства источника «Браузер» в OBS',
    },
  },
  {
    title: 'Настрой положение и масштаб виджета',
    text: 'Настрой положение виджета и его масштаб под себя.',
    image: {
      src: '/images/obs-guide/step-4-position-scale.png',
      alt: 'Настройка положения и масштаба виджета на сцене OBS',
    },
  },
];

export type StatsWidgetPageContentGuideProps = {
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
};

export function StatsWidgetPageContentGuide(props: StatsWidgetPageContentGuideProps) {
  const { className } = props;
  const [ expandedImage, setExpandedImage ] = useState<StatsWidgetPageContentGuideLightboxImage | null>(null);

  const closeExpandedImage = useCallback(() => {
    setExpandedImage(null);
  }, []);

  const openExpandedImage = useCallback((image: NonNullable<ComponentProps<typeof StatsWidgetPageContentGuideStep>['image']>) => {
    setExpandedImage({ src: image.src, alt: image.alt });
  }, []);

  return (
    <Section
      title='Как использовать ссылку в OBS'
      className={classNames('stats-widget-page-content-guide', className)}
    >
      <ol className='stats-widget-page-content-guide__steps' aria-label='Как подключить виджет в OBS'>
        {STEPS.map((step, index) => (
          <StatsWidgetPageContentGuideStep
            key={step.title}
            title={step.title}
            text={step.text}
            index={index}
            image={step.image}
            onImageClick={openExpandedImage}
          />
        ))}
      </ol>

      <StatsWidgetPageContentGuideLightbox
        image={expandedImage}
        onClose={closeExpandedImage}
      />
    </Section>
  );
}
