import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { Button, ButtonVariant } from '../../ui/button/button'
import { Input } from '../../ui/input/input'
import { LinkButton } from '../../ui/link-button/link-button'
import { useToast } from '@components/toast-provider/use-toast'
import { buildUrl, type BoolSetting } from '@utils/widget-url'
import { StorageLocal } from '@utils/app-local-storage'
import './match-result-widget-page.scss'

export function MatchResultWidgetPage() {
  const nicknameStorage = StorageLocal().path('widgets.overlay.nickname')
  const { showToast } = useToast()

  const [ nickname, setNickname ] = useState(() => nicknameStorage.get(''))
  const [ hideRank, setHideRank ] = useState<BoolSetting>('false')
  const [ hideChallenger, setHideChallenger ] = useState<BoolSetting>('false')
  const [ transparent, setTransparent ] = useState<BoolSetting>('true')
  const [ testMode, setTestMode ] = useState<BoolSetting>('false')

  const canBuild = nickname.trim().length > 0

  const handleNicknameChange = (value: string) => {
    setNickname(value)
    if (value.trim().length === 0) {
      nicknameStorage.delete()
      return
    }
    nicknameStorage.set(value)
  }

  const widgetUrl = useMemo(() => {
    if (!canBuild) return ''
    return buildUrl('/matchResult', {
      nickname: nickname.trim(),
      hideRank,
      hideChallenger,
      transparent,
      test: testMode,
    })
  }, [ canBuild, nickname, hideRank, hideChallenger, transparent, testMode ])

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
    <main className='match-result-widget-page'>
      <AppHeader/>
      <section className='match-result-widget-page__card'>
        <div className='match-result-widget-page__top'>
          <p className='match-result-widget-page__badge'>WIDGET PAGE</p>
          <h1 className='match-result-widget-page__top-title'>Match Result Widget</h1>
          <p className='match-result-widget-page__top-lead'>
            Алерт для стрима: показывает VICTORY/DEFEAT при новом завершенном матче. Можно включить тестовый режим и
            проверить анимацию без ожидания реальной игры.
          </p>
        </div>

        <div className='match-result-widget-page__hint-list'>
          <span className='match-result-widget-page__hint-chip'>
            Обязательный параметр: nickname
          </span>
          <span className='match-result-widget-page__hint-chip'>
            Тест: test=true
          </span>
          <span className='match-result-widget-page__hint-chip'>
            Для OBS используйте Browser Source
          </span>
        </div>

        <div className='match-result-widget-page__grid'>
          <label className='match-result-widget-page__grid-field'>
            Ник FACEIT
            <Input
              className='match-result-widget-page__nickname-input'
              isClearable
              name='nickname'
              type='text'
              value={nickname}
              onChange={handleNicknameChange}
              placeholder='например: s1mple'
              autoComplete='nickname'
            />
          </label>

          <label className='match-result-widget-page__grid-field'>
            test
            <select
              className='match-result-widget-page__grid-select'
              value={testMode}
              onChange={(e) => setTestMode(e.target.value as BoolSetting)}
            >
              <option value='false'>false</option>
              <option value='true'>true</option>
            </select>
          </label>

          <label className='match-result-widget-page__grid-field'>
            hideRank
            <select
              className='match-result-widget-page__grid-select'
              value={hideRank}
              onChange={(e) => setHideRank(e.target.value as BoolSetting)}
            >
              <option value='false'>false</option>
              <option value='true'>true</option>
            </select>
          </label>

          <label className='match-result-widget-page__grid-field'>
            hideChallenger
            <select
              className='match-result-widget-page__grid-select'
              value={hideChallenger}
              onChange={(e) => setHideChallenger(e.target.value as BoolSetting)}
            >
              <option value='false'>false</option>
              <option value='true'>true</option>
            </select>
          </label>

          <label className='match-result-widget-page__grid-field'>
            transparent
            <select
              className='match-result-widget-page__grid-select'
              value={transparent}
              onChange={(e) => setTransparent(e.target.value as BoolSetting)}
            >
              <option value='true'>true</option>
              <option value='false'>false</option>
            </select>
          </label>
        </div>

        <div className='match-result-widget-page__link-row'>
          <input
            className='match-result-widget-page__link-url'
            type='text'
            readOnly
            value={widgetUrl}
            placeholder='Укажи nickname, чтобы сгенерировать ссылку'
            aria-label='Ссылка на match result widget'
          />
          <Button
            variant={ButtonVariant.Primary}
            className='match-result-widget-page__copy-url'
            onClick={() => void copy()}
            disabled={!canBuild}
          >
            Копировать URL
          </Button>
          <LinkButton
            className='match-result-widget-page__open-widget'
            href={widgetUrl}
            target='_blank'
            disabled={!canBuild}
          >
            Открыть виджет
          </LinkButton>
        </div>

        <div className='match-result-widget-page__footer'>
          <Link to='/' className='match-result-widget-page__link'>На главную</Link>
          <Link to='/widgets/stats' className='match-result-widget-page__link'>К странице Stats Widget</Link>
        </div>
      </section>
    </main>
  )
}
