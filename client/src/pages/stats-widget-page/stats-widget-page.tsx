import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { buildUrl } from '@utils/widget-url'
import './stats-widget-page.scss'

export function StatsWidgetPage() {
  const [ nickname, setNickname ] = useState('')
  const [ copied, setCopied ] = useState(false)
  const canBuild = nickname.trim().length > 0

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
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="stats-widget-page">
      <AppHeader />
      <section className="stats-widget-page__card">
        <div className="stats-widget-page__top">
          <p className="stats-widget-page__badge">WIDGET PAGE</p>
          <h1>Stats Widget</h1>
          <p>
            Виджет с ELO, уровнем, winrate и актуальной статистикой игрока FACEIT. Здесь можно настроить параметры и сразу
            получить ссылку для OBS.
          </p>
        </div>

        <div className="stats-widget-page__hint-list">
          <span>
            1) Укажи ник FACEIT
          </span>
          <span>
            2) Скопируй URL
          </span>
          <span>
            3) Вставь ссылку в OBS Browser Source
          </span>
        </div>

        <div className="stats-widget-page__grid">
          <label>
            Ник FACEIT
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="например: s1mple"
            />
          </label>
        </div>

        <div className="stats-widget-page__link-row">
          <input
            type="text"
            readOnly
            value={widgetUrl || 'Укажи nickname, чтобы сгенерировать ссылку'}
            aria-label="Ссылка на stats widget"
          />
          <button type="button" onClick={() => void copy()} disabled={!canBuild}>
            {copied ? 'Скопировано' : 'Копировать URL'}
          </button>
          <a
            href={widgetUrl || undefined}
            target="_blank"
            rel="noreferrer"
            className={`stats-widget-page__open ${canBuild ? '' : 'stats-widget-page__open--disabled'}`}
          >
            Открыть виджет
          </a>
        </div>

        <div className="stats-widget-page__footer">
          <Link to="/" className="stats-widget-page__link">На главную</Link>
          <Link to="/widgets/match-result" className="stats-widget-page__link">К странице Match Result</Link>
        </div>
      </section>
    </main>
  )
}
