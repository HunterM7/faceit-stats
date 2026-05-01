import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, ButtonVariant } from '../../ui/button/button'
import { useToast } from '@components/toast-provider/use-toast'
import {
  AdminUnauthorizedError,
  requestAdminOverview,
  type AdminOverviewPayload,
  type AdminPeriod,
  type AdminScope,
} from '@requests/admin'
import './admin-page.scss'

const ADMIN_PERIOD_OPTIONS: Array<{ id: AdminPeriod; label: string }> = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'all', label: 'Всё время' },
]

const ADMIN_SCOPE_OPTIONS: Array<{ id: AdminScope; label: string }> = [
  { id: 'overall', label: 'Общая статистика' },
  { id: 'stats_widget', label: 'Виджет статистики' },
  { id: 'overlay_widget', label: 'Виджет оверлея' },
]

const SCOPE_DESCRIPTION_MAP: Record<AdminScope, string> = {
  overall: 'Мониторинг по всем API-обращениям сервиса.',
  stats_widget: 'Использование страницы виджета статистики и связанных API.',
  overlay_widget: 'Использование страницы оверлея матча и связанных API.',
}

export function AdminPage() {
  const { showToast } = useToast()
  const [ searchParams ] = useSearchParams()
  const [ period, setPeriod ] = useState<AdminPeriod>('day')
  const scopeParam = searchParams.get('scope')
  const scope: AdminScope =
    scopeParam === 'stats_widget' || scopeParam === 'overlay_widget' || scopeParam === 'overall'
      ? scopeParam
      : 'overall'
  const [ overview, setOverview ] = useState<AdminOverviewPayload | null>(null)
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
        const next = await requestAdminOverview(period, scope, authToken)
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
    scope,
    totalEvents: 0,
    uniqueUsers: 0,
    topNicknames: [],
    chart: [],
    latestEvents: [],
    storage: 'disabled',
  }
  const data = overview ?? fallbackOverview
  const maxBarValue = Math.max(1, ...data.chart.map((item) => item.count))
  const scopeDescription = SCOPE_DESCRIPTION_MAP[scope]
  const daySegments = period === 'day'
    ? data.chart.reduce<Array<{ dateKey: string; startIndex: number; endIndex: number }>>((segments, item, index) => {
      const lastSegment = segments[segments.length - 1]
      if (!lastSegment || lastSegment.dateKey !== item.dateKey) {
        segments.push({
          dateKey: item.dateKey,
          startIndex: index,
          endIndex: index,
        })
        return segments
      }

      lastSegment.endIndex = index
      return segments
    }, [])
    : []
  const monthSegments = period === 'month'
    ? data.chart.reduce<Array<{ monthKey: string; startIndex: number; endIndex: number }>>((segments, item, index) => {
      const monthKey = getMonthKey(item.dateKey)
      const lastSegment = segments[segments.length - 1]
      if (!lastSegment || lastSegment.monthKey !== monthKey) {
        segments.push({
          monthKey,
          startIndex: index,
          endIndex: index,
        })
        return segments
      }

      lastSegment.endIndex = index
      return segments
    }, [])
    : []

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

  return (
    <main className='admin-page'>
      <header className='admin-page__header'>
        <Link to='/' className='admin-page__header-home-link'>На главную</Link>
        <nav className='admin-page__sections' aria-label='Разделы админки'>
          {ADMIN_SCOPE_OPTIONS.map((option) => (
            <Link
              key={option.id}
              className={`admin-page__section-link ${scope === option.id ? 'admin-page__section-link--active' : ''}`}
              to={`/admin?scope=${option.id}`}
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
            <p className='admin-page__badge'>ADMIN DASHBOARD</p>
            <h1>Статистика сервиса</h1>
            <p className='admin-page__subtitle'>
              {scopeDescription}
            </p>
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
              <>
                <div
                  className='admin-page__chart'
                  style={{ gridTemplateColumns: `repeat(${data.chart.length}, minmax(18px, 1fr))` }}
                >
                  {data.chart.map((item, index) => {
                    const height = Math.max(8, Math.round((item.count / maxBarValue) * 100))
                    const hasPeriodSplit = index > 0 && (
                      (period === 'day' && item.dateKey !== data.chart[index - 1].dateKey)
                      || (period === 'month' && getMonthKey(item.dateKey) !== getMonthKey(data.chart[index - 1].dateKey))
                    )
                    return (
                      <div
                        key={`${item.dateKey}-${item.label}-${item.count}`}
                        className='admin-page__bar-col'
                      >
                        <div className='admin-page__bar-value'>{item.count}</div>
                        <div className={`admin-page__bar-wrap ${hasPeriodSplit ? 'admin-page__bar-wrap--day-split' : ''}`}>
                          <div className='admin-page__bar' style={{ height: `${height}%` }}/>
                        </div>
                        <div
                          className='admin-page__bar-label'
                          title={period === 'month' ? formatDateKey(item.dateKey) : undefined}
                        >
                          {period === 'month' ? formatMonthDayLabel(item.dateKey) : item.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {period === 'day' ? (
                  <div
                    className='admin-page__day-segments'
                    style={{ gridTemplateColumns: `repeat(${data.chart.length}, minmax(18px, 1fr))` }}
                  >
                    {daySegments.map((segment, index) => (
                      <div
                        key={segment.dateKey}
                        className={`admin-page__day-segment ${getDaySegmentClassName(
                          index,
                          daySegments.length,
                          segment.startIndex,
                          segment.endIndex,
                        )}`}
                        style={{ gridColumn: `${segment.startIndex + 1} / ${segment.endIndex + 2}` }}
                        title={formatDateKey(segment.dateKey)}
                      >
                        {formatDaySegmentLabel(segment.dateKey)}
                      </div>
                    ))}
                  </div>
                ) : null}
                {period === 'month' ? (
                  <div
                    className='admin-page__day-segments'
                    style={{ gridTemplateColumns: `repeat(${data.chart.length}, minmax(18px, 1fr))` }}
                  >
                    {monthSegments.map((segment, index) => (
                      <div
                        key={segment.monthKey}
                        className={`admin-page__day-segment ${getDaySegmentClassName(
                          index,
                          monthSegments.length,
                          segment.startIndex,
                          segment.endIndex,
                        )}`}
                        style={{ gridColumn: `${segment.startIndex + 1} / ${segment.endIndex + 2}` }}
                        title={formatMonthKey(segment.monthKey)}
                      >
                        {formatMonthSegmentLabel(segment.monthKey)}
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </article>

          <article className='admin-page__panel'>
            <h2>Топ FACEIT-ники</h2>
            {data.topNicknames.length === 0 ? (
              <p className='admin-page__empty'>Пока никто не вводил никнеймы.</p>
            ) : (
              <ul className='admin-page__nickname-list'>
                {data.topNicknames.map((item) => (
                  <li key={`${item.nickname}-${item.count}`}>
                    <span>{item.nickname}</span>
                    <span className='admin-page__nickname-elo'>{item.elo ?? '—'} ELO</span>
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

function formatDateKey(dateKey: string): string {
  const [ year, month, day ] = dateKey.split('-')
  return `${day}.${month}.${year}`
}

function formatMonthDayLabel(dateKey: string): string {
  const [ , , day ] = dateKey.split('-')
  return String(Number(day))
}

function formatDaySegmentLabel(dateKey: string): string {
  const todayKey = getUtcDateKey(new Date())
  const yesterdayKey = getUtcDateKey(getUtcDateWithOffset(new Date(), -1))
  if (dateKey === todayKey) {
    return 'сегодня'
  }
  if (dateKey === yesterdayKey) {
    return 'вчера'
  }
  return formatDateKey(dateKey)
}

function getUtcDateKey(date: Date): string {
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getUtcDateWithOffset(date: Date, offsetDays: number): Date {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  next.setUTCDate(next.getUTCDate() + offsetDays)
  return next
}

function getMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7)
}

function getDaySegmentClassName(
  index: number,
  length: number,
  startIndex: number,
  endIndex: number,
): string {
  const isLast = index === length - 1
  if (!isLast) {
    return ''
  }

  const span = endIndex - startIndex + 1
  return span <= 2 ? 'admin-page__day-segment--last' : ''
}

function formatMonthKey(monthKey: string): string {
  const [ year, month ] = monthKey.split('-')
  return `${month}.${year}`
}

function formatMonthSegmentLabel(monthKey: string): string {
  const [ year, month ] = monthKey.split('-')
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1))
  return date.toLocaleString('ru-RU', { month: 'long', timeZone: 'UTC' })
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
