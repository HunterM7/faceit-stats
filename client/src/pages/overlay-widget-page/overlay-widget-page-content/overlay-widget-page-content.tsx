import { useState } from 'react';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import { Input } from '@/ui/input/input';
import { Select } from '@/ui/select/select';
import type { BoolSetting } from '@utils/widget-url';
import { StorageLocal } from '@utils/app-local-storage';
import { StatsWidgetPageContentGuide } from '@pages/stats-widget-page/stats-widget-page-content/stats-widget-page-content-guide/stats-widget-page-content-guide';
import { OverlayWidgetPageLinkSection } from '../overlay-widget-page-link-section/overlay-widget-page-link-section';
import { OverlayWidgetPageContentPreview } from './overlay-widget-page-content-preview/overlay-widget-page-content-preview';
import './overlay-widget-page-content.scss';

export type OverlayWidgetPageContentProps = {
  className?: string | undefined;
};

export function OverlayWidgetPageContent(props: OverlayWidgetPageContentProps) {
  const { className } = props;

  const nicknameStorage = StorageLocal().path('widgets.overlay.nickname');

  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''));
  const [ testMode, setTestMode ] = useState<BoolSetting>('false');

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (!value.trim().length) {
      nicknameStorage.delete();
      return;
    }
    nicknameStorage.set(value);
  };

  return (
    <div className={classNames('overlay-widget-page-content', className)}>
      <header className='overlay-widget-page-content__hero'>
        <div className='overlay-widget-page-content__hero-copy'>
          <h1 className='overlay-widget-page-content__hero-title'>Виджет итога матча FACEIT для OBS</h1>
          <p className='overlay-widget-page-content__hero-lead'>
            Оверлей после матча: победа или поражение, изменение ELO и уровень — Browser Source для OBS и Streamlabs.
          </p>
          <p className='overlay-widget-page-content__hero-lead'>
            Данные обновляются автоматически, когда на FACEIT появляется новый результат.
          </p>
        </div>
      </header>

      <div className='overlay-widget-page-content__metrics'>
        <Section title='Предпросмотр' className='overlay-widget-page-content__preview-section overlay-widget-page-content__metrics-preview'>
          <OverlayWidgetPageContentPreview nickname={nickname}/>
        </Section>

        <Section title='Параметры виджета' className='overlay-widget-page-content__metrics-params'>
          <div className='overlay-widget-page-content__fields'>
            <div className='overlay-widget-page-content__field'>
              <p className='overlay-widget-page-content__input-label overlay-widget-page-content__input-label--in-field'>
                FACEIT ник
              </p>
              <Input
                className='overlay-widget-page-content__text-input'
                isClearable
                name='nickname'
                type='text'
                value={nickname}
                onChange={handleNicknameChange}
                placeholder='например: s1mple'
                autoComplete='nickname'
              />
            </div>
            <div className='overlay-widget-page-content__field'>
              <p className='overlay-widget-page-content__input-label overlay-widget-page-content__input-label--in-field'>
                Тестовый режим
              </p>
              <Select
                value={testMode}
                options={[
                  { value: 'false', label: 'Выключен' },
                  { value: 'true', label: 'Включён' },
                ]}
                onChange={setTestMode}
              />
              <p className='overlay-widget-page-content__hero-lead'>
                В тестовом режиме виджет циклично проигрывает демо-анимации без ожидания реального матча.
              </p>
            </div>
          </div>
        </Section>

        <OverlayWidgetPageLinkSection
          className='overlay-widget-page-content__metrics-link'
          nickname={nickname}
          testMode={testMode}
        />
      </div>

      <StatsWidgetPageContentGuide/>
    </div>
  );
}
