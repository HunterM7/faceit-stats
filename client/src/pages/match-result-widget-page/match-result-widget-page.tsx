import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { Button, ButtonVariant } from '../../ui/button/button'
import { LinkButton } from '../../ui/link-button/link-button'
import { useToast } from '@components/toast-provider/use-toast'
import { buildUrl, type BoolSetting } from '@utils/widget-url'
import './match-result-widget-page.scss'

export function MatchResultWidgetPage() {
  const { showToast } = useToast()
  const [ nickname, setNickname ] = useState('')
  const [ hideRank, setHideRank ] = useState<BoolSetting>('false')
  const [ hideChallenger, setHideChallenger ] = useState<BoolSetting>('false')
  const [ transparent, setTransparent ] = useState<BoolSetting>('true')
  const [ testMode, setTestMode ] = useState<BoolSetting>('false')
  const canBuild = nickname.trim().length > 0

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
          <h1>Match Result Widget</h1>
          <p>
            Алерт для стрима: показывает VICTORY/DEFEAT при новом завершенном матче. Можно включить тестовый режим и
            проверить анимацию без ожидания реальной игры.
          </p>
        </div>

        <div className='match-result-widget-page__hint-list'>
          <span>
            Обязательный параметр: nickname
          </span>
          <span>
            Тест: test=true
          </span>
          <span>
            Для OBS используйте Browser Source
          </span>
        </div>

        <div className='match-result-widget-page__grid'>
          <label>
            Ник FACEIT
            <input
              type='text'
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder='например: s1mple'
            />
          </label>

          <label>
            test
            <select value={testMode} onChange={(e) => setTestMode(e.target.value as BoolSetting)}>
              <option value='false'>false</option>
              <option value='true'>true</option>
            </select>
          </label>

          <label>
            hideRank
            <select value={hideRank} onChange={(e) => setHideRank(e.target.value as BoolSetting)}>
              <option value='false'>false</option>
              <option value='true'>true</option>
            </select>
          </label>

          <label>
            hideChallenger
            <select value={hideChallenger} onChange={(e) => setHideChallenger(e.target.value as BoolSetting)}>
              <option value='false'>false</option>
              <option value='true'>true</option>
            </select>
          </label>

          <label>
            transparent
            <select value={transparent} onChange={(e) => setTransparent(e.target.value as BoolSetting)}>
              <option value='true'>true</option>
              <option value='false'>false</option>
            </select>
          </label>
        </div>

        <div className='match-result-widget-page__link-row'>
          <input
            type='text'
            readOnly
            value={widgetUrl}
            placeholder='Укажи nickname, чтобы сгенерировать ссылку'
            aria-label='Ссылка на match result widget'
          />
          <Button variant={ButtonVariant.Primary} onClick={() => void copy()} disabled={!canBuild}>
            Копировать URL
          </Button>
          <LinkButton href={widgetUrl} target='_blank' disabled={!canBuild}>
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
