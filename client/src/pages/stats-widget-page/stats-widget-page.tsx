import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { Button, ButtonVariant } from '../../ui/button/button'
import { Input } from '../../ui/input/input'
import { LinkButton } from '../../ui/link-button/link-button'
import { useToast } from '@components/toast-provider/use-toast'
import { buildUrl } from '@utils/widget-url'
import { StorageLocal } from '@utils/app-local-storage'
import './stats-widget-page.scss'

export function StatsWidgetPage() {
  const nicknameStorage = StorageLocal().path('widgets.statistics.nickname')

  const { showToast } = useToast()

  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''))

  const canBuild = nickname.trim().length > 0

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    if (!value.trim().length) {
      nicknameStorage.delete()
      return
    }
    nicknameStorage.set(value)
  }

  const widgetUrl = useMemo(
    () => (canBuild
      ? buildUrl('/stats', {
        nickname: nickname.trim(),
      })
      : ''),
    [ canBuild, nickname ],
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
          </article>

          <article className='stats-widget-page__panel stats-widget-page__metric'>
            <p className='stats-widget-page__metric-label'>Как использовать</p>
            <div className='stats-widget-page__hint-list stats-widget-page__hint-list--plain'>
              <span>1) Укажи ник FACEIT</span>
              <span>2) Скопируй URL</span>
              <span>3) Вставь ссылку в OBS Browser Source</span>
            </div>
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
