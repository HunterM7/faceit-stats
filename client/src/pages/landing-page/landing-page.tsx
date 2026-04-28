import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { AppHeader } from '@components/app-header/app-header'
import cs2Bg from '@images/cs2-bg.jpg'
import './landing-page.scss'

export function LandingPage() {
  return (
    <main className="landing">
      <AppHeader />

      <section className="landing__hero">
        <p className="landing__badge">ДЛЯ OBS / BROWSER SOURCE</p>
        <h1>FACEIT виджеты на стрим</h1>
        <p className="landing__subtitle">
          Отдельные страницы каждого виджета с понятными настройками, инструкциями для OBS и быстрым копированием ссылок.
        </p>
      </section>

      <section className="landing__showcase" id="widgets">
        <article
          className="landing__widget-block"
          style={{ '--widget-bg': `url(${cs2Bg})` } as CSSProperties}
        >
          <div className="landing__widget-head">
            <p>Твоя статистика</p>
          </div>
          <Link to="/widgets/stats" className="landing__widget-cta">Создать виджет</Link>
        </article>

        <article
          className="landing__widget-block"
          style={{ '--widget-bg': `url(${cs2Bg})` } as CSSProperties}
        >
          <div className="landing__widget-head">
            <p>Итог матча</p>
          </div>
          <Link to="/widgets/match-result" className="landing__widget-cta">Создать виджет</Link>
        </article>
      </section>

      <footer className="landing__footer">
        <p>FACEIT Widgets for OBS</p>
      </footer>
    </main>
  )
}
