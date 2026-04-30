import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@components/app-header/app-header'
import { useToast } from '@components/toast-provider/use-toast'
import {
  AdminUnauthorizedError,
  requestAdminOverview,
  type AdminOverviewPayload,
  type AdminPeriod,
} from '@requests/admin'
import './admin-page.scss'

const ADMIN_PERIOD_OPTIONS: Array<{ id: AdminPeriod; label: string }> = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'all', label: 'Всё время' },
]

export function AdminPage() {
  const { showToast } = useToast()
  const [ period, setPeriod ] = useState<AdminPeriod>('day')
  const [ overview, setOverview ] = useState<AdminOverviewPayload | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ authToken, setAuthToken ] = useState<string>(() => window.sessionStorage.getItem('admin-auth-token') || '')
  const [ isAuthorized, setIsAuthorized ] = useState(false)
  const [ login, setLogin ] = useState('')
  const [ password, setPassword ] = useState('')

  useEffect(() => {
    if (!authToken) {
      return () => undefined
    }

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const next = await requestAdminOverview(period, authToken)
        if (cancelled) return
        setOverview(next)
        setIsAuthorized(true)
      } catch (error) {
        if (cancelled) return
        if (error instanceof AdminUnauthorizedError) {
          setAuthToken('')
          setIsAuthorized(false)
          window.sessionStorage.removeItem('admin-auth-token')
          showToast({
            title: 'Вход отклонен',
            message: 'Неверный логин или пароль. Попробуй снова.',
            variant: 'error',
          })
          return
        }
        showToast({
          title: 'Не удалось загрузить админку',
          message: (error as Error).message || 'Попробуй обновить страницу позже.',
          variant: 'error',
        })
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [ authToken, period, showToast ])

  const submitAuth = () => {
    const normalizedLogin = login.trim()
    if (!normalizedLogin || !password) {
      showToast({
        title: 'Нужны данные для входа',
        message: 'Заполни логин и пароль.',
        variant: 'warning',
      })
      return
    }

    const token = encodeBasicAuthToken(normalizedLogin, password)
    if (!token) {
      showToast({
        title: 'Ошибка кодирования',
        message: 'Не удалось подготовить данные авторизации. Проверь логин и пароль.',
        variant: 'error',
      })
      return
    }
    window.sessionStorage.setItem('admin-auth-token', token)
    setAuthToken(token)
    setIsAuthorized(false)
    setPassword('')
  }

  const logout = () => {
    window.sessionStorage.removeItem('admin-auth-token')
    setAuthToken('')
    setIsAuthorized(false)
    setOverview(null)
    setLogin('')
    setPassword('')
    showToast({
      title: 'Вы вышли из админки',
      variant: 'info',
      durationMs: 2200,
    })
  }

  const fallbackOverview: AdminOverviewPayload = {
    period,
    totalEvents: 0,
    uniqueUsers: 0,
    topNicknames: [],
    chart: [],
    latestEvents: [],
    storage: 'disabled',
  }
  const data = overview ?? fallbackOverview
  const maxBarValue = Math.max(1, ...data.chart.map((item) => item.count))

  if (!authToken) {
    return (
      <main className='admin-page'>
        <AppHeader />
        <div className='admin-page__container'>
          <section className='admin-page__card'>
            <div className='admin-page__auth'>
              <h2>Вход в админку</h2>
              <p>Доступ только по логину и паролю администратора.</p>
              <input
                type='text'
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                placeholder='Логин'
                autoComplete='username'
              />
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='Пароль'
                autoComplete='current-password'
              />
              <button type='button' onClick={submitAuth}>Войти</button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (!isAuthorized) {
    return (
      <main className='admin-page'>
        <AppHeader />
        <section className='admin-page__card'>
          <p className='admin-page__empty'>Проверяем доступ...</p>
        </section>
      </main>
    )
  }

  return (
    <main className='admin-page'>
      <AppHeader />

      <section className='admin-page__card'>
        <div className='admin-page__top'>
          <div>
            <p className='admin-page__badge'>ADMIN DASHBOARD</p>
            <h1>Статистика сервиса</h1>
            <p className='admin-page__subtitle'>
              Мониторинг по обращениям к твоему сервису: период, уникальные пользователи и FACEIT-ники, которые они вводят.
            </p>
            <p className='admin-page__status'>
              Источник данных: {data.storage === 'mongo' ? 'серверная аналитика (MongoDB)' : 'хранилище не настроено'}
            </p>
          </div>
          <div className='admin-page__periods' role='group' aria-label='Выбор периода'>
            {ADMIN_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type='button'
                className={`admin-page__period-button ${period === option.id ? 'admin-page__period-button--active' : ''}`}
                onClick={() => setPeriod(option.id)}
              >
                {option.label}
              </button>
            ))}
            <button type='button' className='admin-page__logout-button' onClick={logout}>Выйти</button>
          </div>
        </div>

        {isLoading ? <p className='admin-page__empty'>Загрузка...</p> : null}

        <div className='admin-page__kpi-grid'>
          <article className='admin-page__kpi-item'>
            <span>Запросов</span>
            <strong>{data.totalEvents}</strong>
            <small>За выбранный период</small>
          </article>
          <article className='admin-page__kpi-item'>
            <span>Уникальных пользователей</span>
            <strong>{data.uniqueUsers}</strong>
            <small>По уникальным FACEIT-никам</small>
          </article>
          <article className='admin-page__kpi-item'>
            <span>Уникальных FACEIT-ников</span>
            <strong>{data.topNicknames.length}</strong>
            <small>Топ за период</small>
          </article>
        </div>

        <div className='admin-page__content-grid'>
          <article className='admin-page__panel'>
            <h2>Активность по дням</h2>
            {data.chart.length === 0 ? (
              <p className='admin-page__empty'>Пока нет данных за выбранный период.</p>
            ) : (
              <div className='admin-page__chart'>
                {data.chart.map((item) => {
                  const height = Math.max(8, Math.round((item.count / maxBarValue) * 100))
                  return (
                    <div key={item.label} className='admin-page__bar-col'>
                      <div className='admin-page__bar-value'>{item.count}</div>
                      <div className='admin-page__bar-wrap'>
                        <div className='admin-page__bar' style={{ height: `${height}%` }} />
                      </div>
                      <div className='admin-page__bar-label'>{item.label}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          <article className='admin-page__panel'>
            <h2>Топ FACEIT-ники</h2>
            {data.topNicknames.length === 0 ? (
              <p className='admin-page__empty'>Пока никто не вводил никнеймы.</p>
            ) : (
              <ul className='admin-page__nickname-list'>
                {data.topNicknames.map((item) => (
                  <li key={item.nickname.toLowerCase()}>
                    <span>{item.nickname}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        <article className='admin-page__panel'>
          <h2>Последние события</h2>
          {data.latestEvents.length === 0 ? (
            <p className='admin-page__empty'>Нет событий.</p>
          ) : (
            <ul className='admin-page__events'>
              {data.latestEvents.map((event) => (
                <li key={`${event.timestamp}-${event.route}-${event.statusCode}`}>
                  <span>{new Date(event.timestamp).toLocaleString('ru-RU')}</span>
                  <span>{event.nicknames.join(', ') || '—'}</span>
                  <span>{event.route} · {event.statusCode} · {event.durationMs}ms</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <footer className='admin-page__footer'>
          <Link to='/' className='admin-page__link'>На главную</Link>
          <Link to='/widgets/stats' className='admin-page__link'>К странице Stats Widget</Link>
        </footer>
      </section>
    </main>
  )
}

function encodeBasicAuthToken(login: string, password: string): string | null {
  try {
    const value = `${login}:${password}`
    const bytes = new TextEncoder().encode(value)
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }
    return window.btoa(binary)
  } catch {
    return null
  }
}
