import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { lastMatch, player } from '@/requests/matchResult'
import './match-result-page.scss'

export function MatchResultPage() {
  const analyticsSource = 'overlay_widget'
  const pollMs = 5000
  const durationMs = 7000
  const testPauseMs = 3000
  const testShowMs = 3000
  const [ visible, setVisible ] = useState(false)
  const [ result, setResult ] = useState<'WIN' | 'LOSS'>('WIN')
  const [ level, setLevel ] = useState<number | null>(null)
  const [ elo, setElo ] = useState<number | null>(null)
  const [ eloDelta, setEloDelta ] = useState<number | null>(null)
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const rawNickname = searchParams.get('nickname')
  const rawTest = searchParams.get('test')
  const isTestMode = rawTest === 'true'
  const nickname = rawNickname?.trim() ?? ''
  const missingNicknameMessage = !isTestMode && !nickname
    ? 'Похоже, что ты не указал свой FACEIT-ник. Добавь его в адресной строке после nickname='
    : null

  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (rawNickname !== null || !isTestMode) nextParams.set('nickname', rawNickname ?? '')
    if (rawTest !== null) nextParams.set('test', rawTest === 'true' ? 'true' : 'false')

    const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search)
    const hasTestWithoutEquals = /(?:\?|&)test(?:&|$)/.test(location.search)
    if (hasNicknameWithoutEquals || hasTestWithoutEquals || nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true })
      return
    }

    if (isTestMode) {
      let showTimer: number | null = null
      let hideTimer: number | null = null

      const schedule = () => {
        const nextResult: 'WIN' | 'LOSS' = Math.random() >= 0.5 ? 'WIN' : 'LOSS'
        const delta = 20 + Math.floor(Math.random() * 11)
        const signedDelta = nextResult === 'WIN' ? delta : -delta

        setResult(nextResult)
        setLevel(10)
        setEloDelta(signedDelta)
        setElo((prev) => Math.max(0, (prev ?? 2100) + signedDelta))
        setVisible(true)

        hideTimer = window.setTimeout(() => {
          setVisible(false)
          showTimer = window.setTimeout(schedule, testPauseMs)
        }, testShowMs)
      }

      showTimer = window.setTimeout(schedule, 0)
      return () => {
        if (showTimer) window.clearTimeout(showTimer)
        if (hideTimer) window.clearTimeout(hideTimer)
      }
    }

    if (!nickname) {
      return
    }

    let lastMatchId: string | null = null
    let lastKnownElo: number | null = null
    let playerId: string | null = null
    let hideTimer: number | null = null
    let pollTimer: number | null = null
    let cancelled = false

    const showMatchResult = (
      nextResult: 'WIN' | 'LOSS',
      nextLevel: number | null,
      nextElo: number | null,
      nextEloDelta: number | null,
    ) => {
      setResult(nextResult)
      setLevel(nextLevel)
      setElo(nextElo)
      setEloDelta(nextEloDelta)
      setVisible(true)
      if (hideTimer) window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => setVisible(false), durationMs)
    }

    const pollLastMatch = async () => {
      try {
        if (!playerId) {
          return
        }
        if (cancelled) {
          return
        }
        const matchData = await lastMatch(playerId, analyticsSource)
        if (!matchData?.matchId) {
          return
        }
        if (matchData.status?.toUpperCase() !== 'FINISHED') {
          return
        }
        if (matchData.result === 'UNKNOWN' || !matchData.result) {
          return
        }

        if (!lastMatchId) {
          lastMatchId = matchData.matchId
          return
        }
        if (matchData.matchId === lastMatchId) return

        const playerPayload = await player(nickname, analyticsSource)
        if (cancelled) return

        const nextElo = typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null
        const nextLevel =
          typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null
        const previousElo = lastKnownElo
        let computedDelta: number | null = null
        if (typeof nextElo === 'number' && typeof previousElo === 'number') {
          computedDelta = nextElo - previousElo
        }

        lastMatchId = matchData.matchId
        lastKnownElo = nextElo
        showMatchResult(matchData.result === 'LOSS' ? 'LOSS' : 'WIN', nextLevel, nextElo, computedDelta)
      } catch (error) {
        console.error('[lastMatch request failed]', error)
      }
    }

    const bootstrap = async () => {
      try {
        const playerPayload = await player(nickname, analyticsSource)
        if (cancelled) return
        playerId = typeof playerPayload.playerId === 'string' ? playerPayload.playerId : null
        if (!playerId) {
          return
        }
        lastKnownElo =
          typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null
        setLevel(typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null)
        setElo(lastKnownElo)

        const matchData = await lastMatch(playerId, analyticsSource)
        if (cancelled) return
        if (matchData.matchId) {
          lastMatchId = matchData.matchId
        }
        pollTimer = window.setInterval(() => void pollLastMatch(), pollMs)
      } catch (error) {
        console.error('[bootstrap lastMatch flow failed]', error)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      if (hideTimer) window.clearTimeout(hideTimer)
      if (pollTimer) window.clearInterval(pollTimer)
    }
  }, [ isTestMode, location.search, nickname, rawNickname, rawTest, searchParams, setSearchParams, testPauseMs, testShowMs ])

  const isMatchResultVisible = visible && !missingNicknameMessage
  let eloDeltaText = '--'
  if (typeof eloDelta === 'number') {
    eloDeltaText = eloDelta >= 0 ? `+${eloDelta}` : `${eloDelta}`
  }

  return (
    <div className='match-result-page'>
      {missingNicknameMessage ? (
        <div className='match-result-page__error-screen'>
          <div className='match-result-page__error-title'>Упс, не нашли такого игрока</div>
          <div className='match-result-page__error-message'>{missingNicknameMessage}</div>
        </div>
      ) : null}
      <div
        className={`match-result-page__card ${isMatchResultVisible ? 'match-result-page__card--show' : 'match-result-page__card--hidden'} ${result === 'LOSS' ? 'match-result-page__card--loss' : 'match-result-page__card--win'}`}
      >
        <div className='match-result-page__badge'>FACEIT</div>
        <div className='match-result-page__result'>{result === 'LOSS' ? 'DEFEAT' : 'VICTORY'}</div>
        <div className='match-result-page__meta'>
          <span>LVL {level ?? '--'}</span>
          <span>ELO {elo ?? '--'}</span>
          <span className={(eloDelta ?? 0) >= 0 ? 'match-result-page__meta-delta--positive' : 'match-result-page__meta-delta--negative'}>
            {eloDeltaText}
          </span>
        </div>
      </div>
    </div>
  )
}
