import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { buildUrl, type BoolSetting } from '@utils/widget-url'
import './stats-widget-page.scss'

export function StatsWidgetPage() {
  const [ nickname, setNickname ] = useState('')
  const [ hideRank, setHideRank ] = useState<BoolSetting>('false')
  const [ hideChallenger, setHideChallenger ] = useState<BoolSetting>('false')
  const [ transparent, setTransparent ] = useState<BoolSetting>('true')
  const [ copied, setCopied ] = useState(false)
  const canBuild = nickname.trim().length > 0

  const widgetUrl = useMemo(
    () => (canBuild
      ? buildUrl('/stats', {
        nickname: nickname.trim(),
        hideRank,
        hideChallenger,
        transparent,
      })
      : ''),
    [ canBuild, nickname, hideRank, hideChallenger, transparent ],
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
    <main className="widget-config-page">
      <AppHeader />
      <section className="widget-config-page__card">
        <div className="widget-config-page__top">
          <p className="widget-config-page__badge">WIDGET PAGE</p>
          <h1>Stats Widget</h1>
          <p>
            Виджет с ELO, уровнем, winrate и актуальной статистикой игрока FACEIT. Здесь можно настроить параметры и сразу
            получить ссылку для OBS.
          </p>
        </div>

        <div className="widget-config-page__hint-list">
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

        <div className="widget-config-page__grid">
          <label>
            Ник FACEIT
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="например: s1mple"
            />
          </label>

          <label>
            hideRank
            <select value={hideRank} onChange={(e) => setHideRank(e.target.value as BoolSetting)}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </label>

          <label>
            hideChallenger
            <select value={hideChallenger} onChange={(e) => setHideChallenger(e.target.value as BoolSetting)}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </label>

          <label>
            transparent
            <select value={transparent} onChange={(e) => setTransparent(e.target.value as BoolSetting)}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </label>
        </div>

        <div className="widget-config-page__link-row">
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
            className={`widget-config-page__open ${canBuild ? '' : 'widget-config-page__open--disabled'}`}
          >
            Открыть виджет
          </a>
        </div>

        <div className="widget-config-page__footer">
          <Link to="/" className="widget-config-page__link">На главную</Link>
          <Link to="/widgets/match-result" className="widget-config-page__link">К странице Match Result</Link>
        </div>
      </section>
    </main>
  )
}
