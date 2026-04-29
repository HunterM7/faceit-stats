import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import './duo-finder-page.scss'

export function DuoFinderPage() {
  return (
    <main className='duo-finder-page'>
      <AppHeader />
      <section className='duo-finder-page__card'>
        <h1 className='duo-finder-page__title'>Duo Finder (CS:GO) временно недоступен</h1>
        <p className='duo-finder-page__subtitle'>
          Мы обновляем страницу поиска матчей. Скоро инструмент вернется в улучшенном виде.
        </p>
        <div className='duo-finder-page__summary'>
          <span>Статус: maintenance</span>
          <span>Доступ: закрыт для пользователей</span>
        </div>
        <Link to='/' className='duo-finder-page__back-link'>Вернуться на главную</Link>
      </section>
    </main>
  )
}
