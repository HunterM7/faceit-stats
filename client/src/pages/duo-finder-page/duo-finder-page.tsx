import { useMemo, useState, type SyntheticEvent } from 'react'
import { requestDuoMatches, type DuoMatchItem } from '@requests/duo'
import './duo-finder-page.scss'

function formatDateTime(iso: string | null): string {
  if (!iso) return 'Unknown date'
  return new Date(iso).toLocaleString()
}

function formatMatchResult(result: DuoMatchItem['result']): string {
  if (result === 'WIN') return 'Победа'
  if (result === 'LOSS') return 'Поражение'
  return 'Матч'
}

export function DuoFinderPage() {
  const params = new URLSearchParams(window.location.search)
  const [ nickname, setNickname ] = useState(params.get('nickname')?.trim() ?? '')
  const [ teammateNickname, setTeammateNickname ] = useState(params.get('teammateNickname')?.trim() ?? '')
  const [ loading, setLoading ] = useState(false)
  const [ errorMessage, setErrorMessage ] = useState<string | null>(null)
  const [ matches, setMatches ] = useState<DuoMatchItem[]>([])
  const [ checkedCount, setCheckedCount ] = useState(0)

  const canSearch = nickname.trim().length > 0 && teammateNickname.trim().length > 0

  const title = useMemo(() => {
    if (!nickname || !teammateNickname) return 'Поиск совместных матчей в CS:GO'
    return `Матчи ${nickname} + ${teammateNickname} (CS:GO)`
  }, [ nickname, teammateNickname ])

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSearch) return

    setLoading(true)
    setErrorMessage(null)

    try {
      const payload = await requestDuoMatches(nickname, teammateNickname)
      setMatches(payload.matches || [])
      setCheckedCount(payload.totalChecked || 0)

      const nextParams = new URLSearchParams({
        nickname: nickname.trim(),
        teammateNickname: teammateNickname.trim(),
      })
      window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`)
    }
    catch {
      setMatches([])
      setCheckedCount(0)
      setErrorMessage('Ошибка сети при запросе матчей')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <main className="duo-finder">
      <section className="duo-finder__card">
        <h1 className="duo-finder__title">{title}</h1>
        <p className="duo-finder__subtitle">Показываем матчи, где оба игрока были в одной команде.</p>

        <form className="duo-finder__form" onSubmit={event => void onSubmit(event)}>
          <label className="duo-finder__form-field">
            Твой FACEIT ник
            <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="например: StRoGo" />
          </label>
          <label className="duo-finder__form-field">
            Ник тиммейта
            <input
              value={teammateNickname}
              onChange={e => setTeammateNickname(e.target.value)}
              placeholder="например: skywhywalker"
            />
          </label>
          <button className="duo-finder__form-submit" type="submit" disabled={!canSearch || loading}>
            {loading ? 'Ищем...' : 'Найти совместные игры'}
          </button>
        </form>

        {errorMessage ? <p className="duo-finder__error">{errorMessage}</p> : null}

        <div className="duo-finder__summary">
          <span>
            Проверено матчей:
            {checkedCount}
          </span>
          <span>
            Найдено совместных:
            {matches.length}
          </span>
        </div>

        <div className="duo-finder__list">
          {matches.length === 0
            ? (
              <p className="duo-finder__empty">Совместные игры пока не найдены.</p>
            )
            : (
              matches.map(match => (
                <article
                  key={match.matchId}
                  className={`duo-finder__item ${match.result === 'WIN' ? 'duo-finder__item--win' : 'duo-finder__item--loss'}`}
                >
                  <div className="duo-finder__item-head">
                    <strong>{formatMatchResult(match.result)}</strong>
                    <span>{formatDateTime(match.finishedAt)}</span>
                  </div>
                  <div className="duo-finder__item-body">
                    <span>
                      Счет:
                      {match.teamScore ?? '-'}
                      {' '}
                      :
                      {match.enemyScore ?? '-'}
                    </span>
                    <span>
                      Статус:
                      {match.status || 'unknown'}
                    </span>
                    {match.faceitUrl
                      ? (
                        <a href={match.faceitUrl} target="_blank" rel="noreferrer">
                          Открыть матч
                        </a>
                      )
                      : null}
                  </div>
                </article>
              ))
            )}
        </div>
      </section>
    </main>
  )
}
