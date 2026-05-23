import { startTransition, useEffect, useState } from 'react';
import { requestStats, type StatsPayload, type StatsRatingQuery } from '@requests/stats';
import { classNames } from '@/utils/classNames';
import { Section } from '@/components/section/section';
import { Button, ButtonVariant } from '@/ui/button/button';
import { Input } from '@/ui/input/input';
import { Select } from '@/ui/select/select';
import { StorageLocal } from '@utils/app-local-storage';
import { StatsWidgetPageLinkSection } from '../stats-widget-page-link-section/stats-widget-page-link-section';
import {
  StatsWidgetPageContentPreview,
  type StatsWidgetPagePreviewState,
} from './stats-widget-page-content-preview/stats-widget-page-content-preview';
import { StatsWidgetPageContentHeroSteps } from './stats-widget-page-content-hero-steps/stats-widget-page-content-hero-steps';
import './stats-widget-page-content.scss';

const DEFAULT_WIDGET_BG_PERCENT = 96;
const DEFAULT_WIDGET_BORDER_RADIUS_PX = 16;
const DEFAULT_RATING_MODE: StatsRatingQuery = 'country';
const STATS_WIDGET_PREVIEW_SOURCE = 'stats_widget' as const;
const BORDER_RADIUS_STORAGE_DEFAULT = Number.NaN;
const BACKGROUND_OPACITY_STORAGE_DEFAULT = Number.NaN;

function parseRatingMode(stored: unknown): StatsRatingQuery {
  if (stored === 'region' || stored === 'both') {
    return stored;
  }
  return 'country';
}

function normalizeBackgroundOpacityPercent(stored: unknown): number {
  if (typeof stored === 'string') {
    const trimmed = stored.trim();
    if (!trimmed.length || !/^\d+$/.test(trimmed)) {
      return DEFAULT_WIDGET_BG_PERCENT;
    }
    stored = Number(trimmed);
  }
  if (typeof stored !== 'number' || Number.isNaN(stored) || !Number.isFinite(stored)) {
    return DEFAULT_WIDGET_BG_PERCENT;
  }
  const rounded = Math.round(stored);
  if (rounded < 0 || rounded > 100) {
    return DEFAULT_WIDGET_BG_PERCENT;
  }
  return rounded;
}

function normalizeBorderRadiusPx(stored: unknown): number {
  const parsed = typeof stored === 'number'
    ? stored
    : Number(String(stored).trim());
  if (!Number.isFinite(parsed)) {
    return DEFAULT_WIDGET_BORDER_RADIUS_PX;
  }
  const rounded = Math.round(parsed);
  if (rounded < 0 || rounded > 18) {
    return DEFAULT_WIDGET_BORDER_RADIUS_PX;
  }
  return rounded;
}

type StatsWidgetPageBgOpacityFieldProps = {
  value: number;
  onChange: (next: number) => void;
  onReset: () => void;
  isResetDisabled: boolean;
};

function StatsWidgetPageBgOpacityField(props: StatsWidgetPageBgOpacityFieldProps) {
  const { value, onChange, onReset, isResetDisabled } = props;

  return (
    <div className='stats-widget-page-content__field'>
      <div className='stats-widget-page-content__field-label-row'>
        <p className='stats-widget-page-content__input-label stats-widget-page-content__input-label--inline'>
          Прозрачность фона
        </p>
        <div className='stats-widget-page-content__field-actions'>
          <span className='stats-widget-page-content__field-value' aria-live='polite'>{value}</span>
          <Button
            variant={ButtonVariant.Secondary}
            className='stats-widget-page-content__field-reset'
            disabled={isResetDisabled}
            onClick={onReset}
            aria-label='Сбросить прозрачность фона к значению по умолчанию'
          >
            Сброс
          </Button>
        </div>
      </div>
      <input
        type='range'
        name='bg'
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className='stats-widget-page-content__range'
        aria-label='Прозрачность фона виджета, проценты от 0 до 100'
      />
    </div>
  );
}

type StatsWidgetPageBorderRadiusFieldProps = {
  value: number;
  onChange: (next: number) => void;
  onReset: () => void;
  isResetDisabled: boolean;
};

function StatsWidgetPageBorderRadiusField(props: StatsWidgetPageBorderRadiusFieldProps) {
  const { value, onChange, onReset, isResetDisabled } = props;

  return (
    <div className='stats-widget-page-content__field'>
      <div className='stats-widget-page-content__field-label-row'>
        <p className='stats-widget-page-content__input-label stats-widget-page-content__input-label--inline'>
          Скругление углов
        </p>
        <div className='stats-widget-page-content__field-actions'>
          <span className='stats-widget-page-content__field-value' aria-live='polite'>{value}</span>
          <Button
            variant={ButtonVariant.Secondary}
            className='stats-widget-page-content__field-reset'
            disabled={isResetDisabled}
            onClick={onReset}
            aria-label='Сбросить скругление углов к значению по умолчанию'
          >
            Сброс
          </Button>
        </div>
      </div>
      <input
        type='range'
        name='radius'
        min={0}
        max={18}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className='stats-widget-page-content__range'
        aria-label='Скругление углов виджета в пикселях, от 0 до 18'
      />
    </div>
  );
}

type StatsWidgetPageRatingFieldProps = {
  value: StatsRatingQuery;
  onChange: (next: StatsRatingQuery) => void;
};

function StatsWidgetPageRatingField(props: StatsWidgetPageRatingFieldProps) {
  const { value, onChange } = props;

  return (
    <div className='stats-widget-page-content__field'>
      <p className='stats-widget-page-content__input-label stats-widget-page-content__input-label--in-field'>
        Отображаемый рейтинг
      </p>
      <Select
        value={value}
        options={[
          { value: 'country', label: 'Только страна' },
          { value: 'region', label: 'Только регион' },
          { value: 'both', label: 'Страна и регион' },
        ]}
        onChange={onChange}
      />
    </div>
  );
}

export type StatsWidgetPageContentProps = {
  className?: string | undefined;
};

export function StatsWidgetPageContent(props: StatsWidgetPageContentProps) {
  const { className } = props;

  const nicknameStorage = StorageLocal().path('widgets.statistics.nickname');
  const backgroundOpacityStorage = StorageLocal().path('widgets.statistics.backgroundOpacity');
  const borderRadiusStorage = StorageLocal().path('widgets.statistics.borderRadius');
  const ratingModeStorage = StorageLocal().path('widgets.statistics.ratingMode');

  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''));
  const [ backgroundOpacity, setBackgroundOpacity ] = useState<number | undefined>(() => {
    const stored = backgroundOpacityStorage.get(BACKGROUND_OPACITY_STORAGE_DEFAULT);
    return Number.isNaN(stored) ? undefined : normalizeBackgroundOpacityPercent(stored);
  });
  const [ borderRadius, setBorderRadius ] = useState<number | undefined>(() => {
    const stored = borderRadiusStorage.get(BORDER_RADIUS_STORAGE_DEFAULT);
    return Number.isNaN(stored) ? undefined : normalizeBorderRadiusPx(stored);
  });
  const [ ratingMode, setRatingMode ] = useState<StatsRatingQuery>(() =>
    parseRatingMode(ratingModeStorage.get(DEFAULT_RATING_MODE)),
  );
  const [ previewState, setPreviewState ] = useState<StatsWidgetPagePreviewState>({ kind: 'empty' });

  useEffect(() => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      startTransition(() => {
        setPreviewState({ kind: 'empty' });
      });
      return;
    }
    let cancelled = false;
    startTransition(() => {
      setPreviewState({ kind: 'loading', nickname: trimmed });
    });
    void requestStats(trimmed, STATS_WIDGET_PREVIEW_SOURCE, 'both', { preview: true })
      .then((stats: StatsPayload) => {
        if (cancelled) {
          return;
        }
        setPreviewState({ kind: 'ready', nickname: trimmed, stats });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Не удалось загрузить данные';
        setPreviewState({ kind: 'error', nickname: trimmed, message });
      });
    return () => {
      cancelled = true;
    };
  }, [ nickname ]);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (!value.trim().length) {
      nicknameStorage.delete();
      return;
    }
    nicknameStorage.set(value);
  };

  const backgroundOpacityForPreview = backgroundOpacity ?? DEFAULT_WIDGET_BG_PERCENT;
  const borderRadiusForPreview = borderRadius ?? DEFAULT_WIDGET_BORDER_RADIUS_PX;

  const handleBgOpacityPercentChange = (next: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(next)));
    setBackgroundOpacity(clamped);
    backgroundOpacityStorage.set(clamped);
  };

  const handleBackgroundOpacityReset = () => {
    setBackgroundOpacity(undefined);
    backgroundOpacityStorage.delete();
  };

  const handleBorderRadiusPxChange = (next: number) => {
    const clamped = Math.min(18, Math.max(0, Math.round(next)));
    setBorderRadius(clamped);
    borderRadiusStorage.set(clamped);
  };

  const handleBorderRadiusReset = () => {
    setBorderRadius(undefined);
    borderRadiusStorage.delete();
  };

  const handleRatingModeChange = (next: StatsRatingQuery) => {
    setRatingMode(next);
    ratingModeStorage.set(next);
  };

  return (
    <div className={classNames('stats-widget-page-content', className)}>
      <header className='stats-widget-page-content__hero'>
        <div className='stats-widget-page-content__hero-copy'>
          <h1 className='stats-widget-page-content__hero-title'>Виджет статистики</h1>
          <p className='stats-widget-page-content__hero-lead'>
            Виджет с твоей основной статистикой с FACEIT - как за сегодня, так и за последние 30 матчей.
            Данные обновляются автоматически в реальном времени.
          </p>
        </div>
        <StatsWidgetPageContentHeroSteps/>
      </header>

      <div className='stats-widget-page-content__metrics'>
        <Section title='Предпросмотр' className='stats-widget-page-content__preview-section stats-widget-page-content__metrics-preview'>
          <StatsWidgetPageContentPreview
            preview={previewState}
            ratingMode={ratingMode}
            backgroundOpacity={backgroundOpacityForPreview}
            borderRadius={borderRadiusForPreview}
          />
        </Section>

        <Section title='Параметры виджета' className='stats-widget-page-content__metrics-params'>
          <div className='stats-widget-page-content__fields'>
            <div className='stats-widget-page-content__field'>
              <p className='stats-widget-page-content__input-label stats-widget-page-content__input-label--in-field'>
                Ник FACEIT
              </p>
              <Input
                className='stats-widget-page-content__text-input'
                isClearable
                name='nickname'
                type='text'
                value={nickname}
                onChange={handleNicknameChange}
                placeholder='например: s1mple'
                autoComplete='nickname'
              />
            </div>
            <StatsWidgetPageBgOpacityField
              value={backgroundOpacityForPreview}
              onChange={handleBgOpacityPercentChange}
              onReset={handleBackgroundOpacityReset}
              isResetDisabled={backgroundOpacity === undefined}
            />
            <StatsWidgetPageBorderRadiusField
              value={borderRadiusForPreview}
              onChange={handleBorderRadiusPxChange}
              onReset={handleBorderRadiusReset}
              isResetDisabled={borderRadius === undefined}
            />
            <StatsWidgetPageRatingField
              value={ratingMode}
              onChange={handleRatingModeChange}
            />
          </div>
        </Section>

        <StatsWidgetPageLinkSection
          className='stats-widget-page-content__metrics-link'
          nickname={nickname}
          backgroundOpacity={backgroundOpacity}
          borderRadius={borderRadius}
          ratingMode={ratingMode}
        />
      </div>
    </div>
  );
}
