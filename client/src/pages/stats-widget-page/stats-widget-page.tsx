import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { Button, ButtonVariant } from '../../ui/button/button'
import { Input } from '../../ui/input/input'
import { LinkButton } from '../../ui/link-button/link-button'
import { useToast } from '@components/toast-provider/use-toast'
import { buildUrl } from '@utils/widget-url'
import { StorageLocal } from '@utils/app-local-storage'
import { StatsWidgetPagePreview } from './stats-widget-page-preview'
import './stats-widget-page.scss'

const DEFAULT_WIDGET_BG_PERCENT = 96
const DEFAULT_WIDGET_BORDER_RADIUS_PX = 16

function parseBgOpacityPercent(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed.length || !/^\d+$/.test(trimmed)) {
    return DEFAULT_WIDGET_BG_PERCENT
  }
  const parsed = Number(trimmed)
  if (parsed < 0 || parsed > 100) {
    return DEFAULT_WIDGET_BG_PERCENT
  }
  return parsed
}

function normalizeBorderRadiusPx(stored: unknown): number {
  const parsed = typeof stored === 'number'
    ? stored
    : Number(String(stored).trim())
  if (!Number.isFinite(parsed)) {
    return DEFAULT_WIDGET_BORDER_RADIUS_PX
  }
  const rounded = Math.round(parsed)
  if (rounded < 0 || rounded > 18) {
    return DEFAULT_WIDGET_BORDER_RADIUS_PX
  }
  return rounded
}

type StatsWidgetPageBgOpacityFieldProps = {
  value: number;
  defaultPercent: number;
  onChange: (next: number) => void;
  onReset: () => void;
}

function StatsWidgetPageBgOpacityField(props: StatsWidgetPageBgOpacityFieldProps) {
  const { value, defaultPercent, onChange, onReset } = props
  const isAtDefault = value === defaultPercent

  return (
    <div className='stats-widget-page__bg-shell'>
      <div className='stats-widget-page__bg-row'>
        <p className='stats-widget-page__bg-label'>
          Прозрачность фона
        </p>
        <div className='stats-widget-page__bg-trailing'>
          <span className='stats-widget-page__bg-value' aria-live='polite'>{value}</span>
          <Button
            variant={ButtonVariant.Secondary}
            className='stats-widget-page__bg-reset'
            disabled={isAtDefault}
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
        className='stats-widget-page__bg-range'
        aria-label='Прозрачность фона виджета, проценты от 0 до 100'
      />
    </div>
  )
}

type StatsWidgetPageBorderRadiusFieldProps = {
  value: number;
  defaultPx: number;
  onChange: (next: number) => void;
  onReset: () => void;
}

function StatsWidgetPageBorderRadiusField(props: StatsWidgetPageBorderRadiusFieldProps) {
  const { value, defaultPx, onChange, onReset } = props
  const isAtDefault = value === defaultPx

  return (
    <div className='stats-widget-page__bg-shell stats-widget-page__bg-shell--stacked'>
      <div className='stats-widget-page__bg-row'>
        <p className='stats-widget-page__bg-label'>
          Скругление углов
        </p>
        <div className='stats-widget-page__bg-trailing'>
          <span className='stats-widget-page__bg-value' aria-live='polite'>{value}</span>
          <Button
            variant={ButtonVariant.Secondary}
            className='stats-widget-page__bg-reset'
            disabled={isAtDefault}
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
        className='stats-widget-page__bg-range'
        aria-label='Скругление углов виджета в пикселях, от 0 до 18'
      />
    </div>
  )
}

export function StatsWidgetPage() {
  const nicknameStorage = StorageLocal().path('widgets.statistics.nickname')
  const backgroundOpacityStorage = StorageLocal().path('widgets.statistics.backgroundOpacity')
  const borderRadiusStorage = StorageLocal().path('widgets.statistics.borderRadius')

  const { showToast } = useToast()

  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''))
  const [ backgroundOpacityPercent, setBackgroundOpacityPercent ] = useState(() => parseBgOpacityPercent(backgroundOpacityStorage.get('')))
  const [ borderRadius, setBorderRadius ] = useState(() => normalizeBorderRadiusPx(
    borderRadiusStorage.get(DEFAULT_WIDGET_BORDER_RADIUS_PX),
  ))

  const canBuild = nickname.trim().length > 0

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    if (!value.trim().length) {
      nicknameStorage.delete()
      return
    }
    nicknameStorage.set(value)
  }

  const handleBgOpacityPercentChange = (next: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(next)))
    setBackgroundOpacityPercent(clamped)
    if (clamped === DEFAULT_WIDGET_BG_PERCENT) {
      backgroundOpacityStorage.delete()
      return
    }
    backgroundOpacityStorage.set(String(clamped))
  }

  const handleBackgroundOpacityReset = () => {
    setBackgroundOpacityPercent(DEFAULT_WIDGET_BG_PERCENT)
    backgroundOpacityStorage.delete()
  }

  const handleBorderRadiusPxChange = (next: number) => {
    const clamped = Math.min(18, Math.max(0, Math.round(next)))
    setBorderRadius(clamped)
    if (clamped === DEFAULT_WIDGET_BORDER_RADIUS_PX) {
      borderRadiusStorage.delete()
      return
    }
    borderRadiusStorage.set(clamped)
  }

  const handleBorderRadiusReset = () => {
    setBorderRadius(DEFAULT_WIDGET_BORDER_RADIUS_PX)
    borderRadiusStorage.delete()
  }

  const bgForUrl = backgroundOpacityPercent === DEFAULT_WIDGET_BG_PERCENT ? undefined : backgroundOpacityPercent
  const radiusForUrl = borderRadius === DEFAULT_WIDGET_BORDER_RADIUS_PX ? undefined : borderRadius

  const widgetUrl = useMemo(
    () => (canBuild
      ? buildUrl('/stats', {
        nickname: nickname.trim(),
        bg: bgForUrl,
        radius: radiusForUrl,
      })
      : ''),
    [ bgForUrl, canBuild, nickname, radiusForUrl ],
  )

  const copy = async () => {
    if (!widgetUrl) return
    try {
      await navigator.clipboard.writeText(widgetUrl)
      showToast({
        title: 'Скопировано',
        variant: 'success',
        durationMs: 2200,
      })
    } catch {
      showToast({
        title: 'Не удалось скопировать',
        message: 'Разреши доступ к буферу обмена или скопируй ссылку вручную.',
        variant: 'error',
      })
    }
  }

  return (
    <main className='stats-widget-page'>
      <AppHeader/>
      <section className='stats-widget-page__layout'>
        <div className='stats-widget-page__panel stats-widget-page__panel--header'>
          <div className='stats-widget-page__top'>
            <p className='stats-widget-page__badge'>WIDGET PAGE</p>
            <h1>Stats Widget</h1>
            <p>
              Виджет с ELO, уровнем, winrate и актуальной статистикой игрока FACEIT. Здесь можно настроить параметры и сразу
              получить ссылку для OBS.
            </p>
          </div>
          <div className='stats-widget-page__header-actions'>
            <Link to='/' className='stats-widget-page__link'>На главную</Link>
            <Link to='/widgets/match-result' className='stats-widget-page__link'>К странице Match Result</Link>
          </div>
        </div>

        <div className='stats-widget-page__metrics'>
          <article className='stats-widget-page__panel stats-widget-page__metric'>
            <p className='stats-widget-page__metric-label'>Параметры виджета</p>
            <p className='stats-widget-page__input-label'>Ник FACEIT</p>
            <Input
              className='stats-widget-page__text-input'
              isClearable
              name='nickname'
              type='text'
              value={nickname}
              onChange={handleNicknameChange}
              placeholder='например: s1mple'
              autoComplete='nickname'
            />
            <StatsWidgetPageBgOpacityField
              value={backgroundOpacityPercent}
              defaultPercent={DEFAULT_WIDGET_BG_PERCENT}
              onChange={handleBgOpacityPercentChange}
              onReset={handleBackgroundOpacityReset}
            />
            <StatsWidgetPageBorderRadiusField
              value={borderRadius}
              defaultPx={DEFAULT_WIDGET_BORDER_RADIUS_PX}
              onChange={handleBorderRadiusPxChange}
              onReset={handleBorderRadiusReset}
            />
          </article>

          <article className='stats-widget-page__panel stats-widget-page__metric stats-widget-page__metric--preview'>
            <p className='stats-widget-page__metric-label'>Предпросмотр</p>
            <StatsWidgetPagePreview
              nickname={nickname}
              backgroundOpacityPercent={backgroundOpacityPercent}
              borderRadius={borderRadius}
            />
          </article>
        </div>

        <div className='stats-widget-page__panel stats-widget-page__comment'>
          <p className='stats-widget-page__comment-title'>Ссылка на Stats Widget</p>
          <div className='stats-widget-page__hint-list stats-widget-page__hint-list--muted'>
            <span>Заполни nickname, чтобы сгенерировать ссылку</span>
          </div>
          <div className='stats-widget-page__link-row'>
            <input
              type='text'
              readOnly
              value={widgetUrl}
              placeholder='Укажи nickname, чтобы сгенерировать ссылку'
              aria-label='Ссылка на stats widget'
            />
            <Button variant={ButtonVariant.Primary} onClick={() => void copy()} disabled={!canBuild}>
              Копировать URL
            </Button>
            <LinkButton href={widgetUrl} target='_blank' disabled={!canBuild}>
              Открыть виджет
            </LinkButton>
          </div>
        </div>
      </section>
    </main>
  )
}
