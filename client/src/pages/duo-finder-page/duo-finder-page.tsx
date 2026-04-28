import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import './duo-finder-page.scss'

export function DuoFinderPage() {
  return (
    <main className="duo-finder">
      <AppHeader />
      <section className="duo-finder__card">
        <h1 className="duo-finder__title">Duo Finder (CS:GO) временно недоступен</h1>
        <p className="duo-finder__subtitle">
          Мы обновляем страницу поиска матчей. Скоро инструмент вернется в улучшенном виде.
        </p>
        <div className="duo-finder__summary">
          <span>Статус: maintenance</span>
          <span>Доступ: закрыт для пользователей</span>
        </div>
        <Link to="/" className="duo-finder__back-link">Вернуться на главную</Link>
      </section>
    </main>
  )
}
