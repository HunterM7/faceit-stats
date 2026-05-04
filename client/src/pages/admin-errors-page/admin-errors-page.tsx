import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, ButtonVariant } from '@/ui/button/button'
import { Input } from '@/ui/input/input'
import { useToast } from '@components/toast-provider/use-toast'
import {
  AdminUnauthorizedError,
  requestAdminErrors,
  type AdminErrorsPayload,
  type AdminPeriod,
  type AdminScope,
} from '@requests/admin'
import '../admin-page/admin-page.scss'
import './admin-errors-page.scss'

const ADMIN_PERIOD_OPTIONS: Array<{ id: AdminPeriod; label: string }> = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'all', label: 'Всё время' },
]

const ADMIN_SCOPE_OPTIONS: Array<{ id: AdminScope; label: string }> = [
  { id: 'overall', label: 'Все источники' },
  { id: 'stats_widget', label: 'Stats Widget' },
  { id: 'overlay_widget', label: 'Overlay Widget' },
]

export function AdminErrorsPage() {
  const { showToast } = useToast()
  const [ searchParams ] = useSearchParams()
  const scopeParam = searchParams.get('scope')
  const scope: AdminScope =
    scopeParam === 'stats_widget' || scopeParam === 'overlay_widget' || scopeParam === 'overall'
      ? scopeParam
      : 'overall'
  const [ period, setPeriod ] = useState<AdminPeriod>('day')
  const [ errorsData, setErrorsData ] = useState<AdminErrorsPayload | null>(null)
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
      try {
        const next = await requestAdminErrors(period, scope, authToken)
        if (cancelled) return
        setErrorsData(next)
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
          title: 'Не удалось загрузить ошибки',
          message: (error as Error).message || 'Попробуй обновить страницу позже.',
          variant: 'error',
        })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [ authToken, period, scope, showToast ])

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
        message: 'Не удалось подготовить данные авторизации.',
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
    setErrorsData(null)
    setLogin('')
    setPassword('')
  }

  if (!authToken) {
    return (
      <main className='admin-page'>
        <header className='admin-page__header'>
          <Link to='/' className='admin-page__header-home-link'>На главную</Link>
          <span className='admin-page__header-spacer'/>
        </header>
        <div className='admin-page__container'>
          <section className='admin-page__card admin-page__card--auth'>
            <div className='admin-page__auth'>
              <h2 className='admin-page__auth-title'>Вход в админку ошибок</h2>
              <Input className='admin-page__auth-input' type='text' value={login} onChange={(value) => setLogin(value)} placeholder='Логин'/>
              <Input className='admin-page__auth-input' type='password' value={password} onChange={(value) => setPassword(value)} placeholder='Пароль'/>
              <Button variant={ButtonVariant.Primary} onClick={submitAuth}>Войти</Button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (!isAuthorized) {
    return (
      <main className='admin-page'>
        <header className='admin-page__header'>
          <Link to='/' className='admin-page__header-home-link'>На главную</Link>
          <Button variant={ButtonVariant.Danger} className='admin-page__logout-button' onClick={logout}>Выйти</Button>
        </header>
        <section className='admin-page__card admin-page__card--status'>
          <p className='admin-page__empty'>Проверяем доступ...</p>
        </section>
      </main>
    )
  }

  const data = errorsData ?? {
    totalErrors: 0,
    latestErrors: [],
    storage: 'disabled' as const,
  }

  return (
    <main className='admin-page admin-errors-page'>
      <header className='admin-page__header'>
        <Link to='/' className='admin-page__header-home-link'>На главную</Link>
        <nav className='admin-page__sections' aria-label='Разделы ошибок'>
          {ADMIN_SCOPE_OPTIONS.map((option) => (
            <Link
              key={option.id}
              className={`admin-page__section-link ${scope === option.id ? 'admin-page__section-link--active' : ''}`}
              to={`/admin/errors?scope=${option.id}`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
        <Button variant={ButtonVariant.Danger} className='admin-page__logout-button' onClick={logout}>Выйти</Button>
      </header>

      <section className='admin-page__card admin-page__card--dashboard'>
        <div className='admin-page__top'>
          <div>
            <p className='admin-page__badge'>ADMIN ERRORS</p>
            <h1 className='admin-page__title'>Список зафиксированных ошибок</h1>
            <p className='admin-page__subtitle'>Полные данные по запросу, на котором сломался обработчик API.</p>
          </div>
          <div className='admin-page__periods' role='group' aria-label='Выбор периода'>
            {ADMIN_PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.id}
                variant={ButtonVariant.Secondary}
                className={`admin-page__period-button ${period === option.id ? 'admin-page__period-button--active' : ''}`}
                onClick={() => setPeriod(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <article className='admin-page__panel'>
          <h2 className='admin-page__panel-title'>Ошибок за период: {data.totalErrors}</h2>
          {data.latestErrors.length === 0 ? (
            <p className='admin-page__empty'>Ошибок не зафиксировано.</p>
          ) : (
            <ul className='admin-errors-page__list'>
              {data.latestErrors.map((event) => (
                <li key={`${event.timestamp}-${event.route}-${event.statusCode}`} className='admin-errors-page__item'>
                  <div className='admin-errors-page__row'>
                    <strong>{new Date(event.timestamp).toLocaleString('ru-RU')}</strong>
                    <span>{event.route} · {event.statusCode} · {event.durationMs}ms</span>
                  </div>
                  <div className='admin-errors-page__row'>
                    <span>Ник: {event.nicknames.join(', ') || '—'}</span>
                    <span>Источник ошибки: {toErrorOriginLabel(event.errorOrigin)}</span>
                  </div>
                  <div className='admin-errors-page__row'>
                    <span>{event.errorMessage || 'Без текста ошибки'}</span>
                  </div>
                  <pre className='admin-errors-page__meta'>
                    {event.serverResponse || 'Нет тела ответа от сервера'}
                  </pre>
                  <pre className='admin-errors-page__meta'>
                    {JSON.stringify(event.request ?? { method: 'unknown', path: event.route, query: {}, params: {} }, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </article>

        <footer className='admin-page__footer'>
          <Link to='/admin' className='admin-page__link'>К общей статистике</Link>
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

function toErrorOriginLabel(origin?: 'faceit' | 'internal' | 'unknown'): string {
  if (origin === 'faceit') return 'FACEIT'
  if (origin === 'internal') return 'Наш backend'
  return 'Не определен'
}
