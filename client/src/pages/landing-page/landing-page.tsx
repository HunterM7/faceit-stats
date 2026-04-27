import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './landing-page.scss'

type BoolSetting = 'true' | 'false'

function buildWidgetUrl(
  pathname: '/stats' | '/matchResult',
  nickname: string,
  hideRank: BoolSetting,
  hideChallenger: BoolSetting,
  transparent: BoolSetting,
): string {
  const params = new URLSearchParams({
    nickname: nickname.trim(),
    hideRank,
    hideChallenger,
    transparent,
  })
  return `${window.location.origin}${pathname}?${params.toString()}`
}

export function LandingPage() {
  const [ nickname, setNickname ] = useState('')
  const [ hideRank, setHideRank ] = useState<BoolSetting>('false')
  const [ hideChallenger, setHideChallenger ] = useState<BoolSetting>('false')
  const [ transparent, setTransparent ] = useState<BoolSetting>('true')
  const [ copied, setCopied ] = useState<'stats' | 'matchResult' | null>(null)

  const canBuild = nickname.trim().length > 0

  const urls = useMemo(
    () => ({
      stats: canBuild ? buildWidgetUrl('/stats', nickname, hideRank, hideChallenger, transparent) : '',
      matchResult: canBuild ? buildWidgetUrl('/matchResult', nickname, hideRank, hideChallenger, transparent) : '',
    }),
    [ canBuild, nickname, hideRank, hideChallenger, transparent ],
  )

  const copy = async (kind: 'stats' | 'matchResult') => {
    if (!urls[kind]) return
    try {
      await navigator.clipboard.writeText(urls[kind])
      setCopied(kind)
      window.setTimeout(() => setCopied((value) => (value === kind ? null : value)), 1400)
    } catch {
      setCopied(null)
    }
  }

  return (
    <main className="landing">
      <section className="landing__hero">
        <p className="landing__badge">FACEIT WIDGETS ДЛЯ OBS</p>
        <h1>Статистика FACEIT на стриме за 1 минуту</h1>
        <p className="landing__subtitle">
          Добавь ник, настрой параметры и получи готовые ссылки для Browser Source в OBS.
        </p>
        <div className="landing__actions">
          <a href="#builder" className="landing__action landing__action--primary">
            Настроить виджеты
          </a>
          <Link to="/stats?nickname=s1mple" className="landing__action landing__action--link">
            Открыть пример
          </Link>
          <Link to="/duo" className="landing__action landing__action--link">
            Найти duo-матчи CS:GO
          </Link>
        </div>
      </section>

      <section className="landing__features">
        <article className="landing__feature-card">
          <h3>Виджет статистики</h3>
          <p>Текущий ELO, уровень и статус последних матчей по нику FACEIT.</p>
        </article>
        <article className="landing__feature-card">
          <h3>Оверлей результата</h3>
          <p>Авто-показ экрана VICTORY / DEFEAT при появлении нового завершенного матча.</p>
        </article>
        <article className="landing__feature-card">
          <h3>Без регистрации</h3>
          <p>Никаких аккаунтов и баз данных. Все настройки передаются прямо в ссылке.</p>
        </article>
        <article className="landing__feature-card">
          <h3>Duo Finder (CS:GO)</h3>
          <p>Отдельная страница для поиска матчей, где вы играли в одной команде с конкретным игроком.</p>
        </article>
      </section>

      <section className="landing__builder" id="builder">
        <h2>Конструктор ссылок</h2>
        <div className="landing__grid">
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

        <div className="landing__links">
          <div className="landing__link-row">
            <span>Ссылка на stats:</span>
            <code>{urls.stats || 'Укажи nickname, чтобы сгенерировать ссылку'}</code>
            <button type="button" onClick={() => void copy('stats')} disabled={!canBuild}>
              {copied === 'stats' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
          <div className="landing__link-row">
            <span>Ссылка на matchResult:</span>
            <code>{urls.matchResult || 'Укажи nickname, чтобы сгенерировать ссылку'}</code>
            <button type="button" onClick={() => void copy('matchResult')} disabled={!canBuild}>
              {copied === 'matchResult' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
        </div>

        <p className="landing__note">
          В OBS добавь два Browser Source: один для <code>/stats</code>, второй для <code>/matchResult</code>.
        </p>
      </section>
    </main>
  )
}
