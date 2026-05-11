import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { lastMatch, player } from '@/requests/matchResult'
import { WidgetOverlay, type MatchResult } from '@widgets/widget-overlay/widget-overlay'
import './overlay-page.scss'

interface OverlayTestMatch {
  before: {
    skillLevel: number;
    elo: number;
  };
  after: {
    skillLevel: number;
    elo: number;
  };
  result: 'WIN' | 'LOSS';
}

const TEST_MATCH_FLOW: OverlayTestMatch[] = [
  { before: { skillLevel: 7, elo: 1528 }, after: { skillLevel: 8, elo: 1553 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1553 }, after: { skillLevel: 7, elo: 1529 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1529 }, after: { skillLevel: 8, elo: 1552 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1552 }, after: { skillLevel: 7, elo: 1530 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1530 }, after: { skillLevel: 8, elo: 1560 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1560 }, after: { skillLevel: 8, elo: 1531 }, result: 'LOSS' },
  { before: { skillLevel: 8, elo: 1531 }, after: { skillLevel: 7, elo: 1510 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1510 }, after: { skillLevel: 8, elo: 1538 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1538 }, after: { skillLevel: 7, elo: 1511 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1511 }, after: { skillLevel: 8, elo: 1537 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1537 }, after: { skillLevel: 7, elo: 1512 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1512 }, after: { skillLevel: 8, elo: 1536 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1536 }, after: { skillLevel: 7, elo: 1513 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1513 }, after: { skillLevel: 8, elo: 1535 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1535 }, after: { skillLevel: 7, elo: 1505 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1505 }, after: { skillLevel: 8, elo: 1534 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1534 }, after: { skillLevel: 7, elo: 1506 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1506 }, after: { skillLevel: 8, elo: 1533 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1533 }, after: { skillLevel: 7, elo: 1507 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1507 }, after: { skillLevel: 7, elo: 1528 }, result: 'WIN' },
]

function overlayResultFromApi(result: string | undefined): 'WIN' | 'LOSS' {
  if (result === 'LOSS') {
    return 'LOSS'
  }
  return 'WIN'
}

const analyticsSource = 'overlay_widget'
const pollMs = 5000
const testPauseMs = 3000
const previewMs = 2000
const deltaLeadInMs = 1000
const counterDurationMs = 1400
const zeroHoldMs = 1000
const hideAfterAnimationMs = previewMs + deltaLeadInMs + counterDurationMs + zeroHoldMs

function captureErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function OverlayPage() {
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const rawNickname = searchParams.get('nickname')
  const rawTest = searchParams.get('test')
  const isTestMode = rawTest === 'true'
  const nickname = rawNickname?.trim() ?? ''
  const missingNicknameMessage = !isTestMode && !nickname
    ? 'Похоже, что ты не указал свой FACEIT-ник. Добавь его в адресной строке после nickname='
    : null

  const [ overlayMatch, setOverlayMatch ] = useState<MatchResult | null>(null)
  const [ overlayLoadError, setOverlayLoadError ] = useState<string | null>(null)

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
      let flowIndex = 0

      const schedule = () => {
        const flowMatch = TEST_MATCH_FLOW[flowIndex % TEST_MATCH_FLOW.length]
        flowIndex += 1

        setOverlayMatch({
          elo: flowMatch.after.elo,
          skillLevel: flowMatch.after.skillLevel,
          result: flowMatch.result,
        })

        hideTimer = window.setTimeout(() => {
          hideTimer = null
          showTimer = window.setTimeout(schedule, testPauseMs)
        }, hideAfterAnimationMs)
      }

      showTimer = window.setTimeout(schedule, 0)
      const resetLoadErrorRaf = window.requestAnimationFrame(() => {
        setOverlayLoadError(null)
      })
      return () => {
        window.cancelAnimationFrame(resetLoadErrorRaf)
        if (showTimer) window.clearTimeout(showTimer)
        if (hideTimer) window.clearTimeout(hideTimer)
        setOverlayMatch(null)
      }
    }

    if (!nickname) {
      let cancelledLocal = false
      const frameId = window.requestAnimationFrame(() => {
        if (!cancelledLocal) {
          setOverlayMatch(null)
          setOverlayLoadError(null)
        }
      })
      return () => {
        cancelledLocal = true
        window.cancelAnimationFrame(frameId)
      }
    }

    let lastMatchId: string | null = null
    let lastKnownElo: number | null = null
    let lastKnownLevel: number | null = null
    let playerId: string | null = null
    let pollTimer: number | null = null
    let cancelled = false

    const resetLoadErrorRaf = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setOverlayLoadError(null)
      }
    })

    const publishMatch = (payload: MatchResult) => {
      setOverlayMatch(payload)
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

        let playerPayload = await player(nickname, analyticsSource)
        if (cancelled) return

        let nextElo = typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null
        let nextLevel =
          typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null
        const previousElo = lastKnownElo
        let computedDelta: number | null = null
        if (typeof nextElo === 'number' && typeof previousElo === 'number') {
          computedDelta = nextElo - previousElo
        }

        if (
          computedDelta === 0
          && typeof nextElo === 'number'
          && typeof previousElo === 'number'
          && nextElo === previousElo
        ) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 700)
          })
          if (cancelled) return
          playerPayload = await player(nickname, analyticsSource)
          if (cancelled) return
          nextElo = typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null
          nextLevel =
            typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null
          if (typeof nextElo === 'number' && typeof previousElo === 'number') {
            computedDelta = nextElo - previousElo
          }
        }

        const snapshotElo = lastKnownElo
        const snapshotLevel = lastKnownLevel
        lastMatchId = matchData.matchId
        lastKnownElo = nextElo
        if (typeof nextLevel === 'number') {
          lastKnownLevel = nextLevel
        }

        const nextLevelForOverlay = typeof nextLevel === 'number' ? nextLevel : snapshotLevel
        const nextEloForOverlay = typeof nextElo === 'number' ? nextElo : snapshotElo

        if (typeof nextEloForOverlay !== 'number' || typeof snapshotElo !== 'number') {
          return
        }

        publishMatch({
          elo: nextEloForOverlay,
          skillLevel: nextLevelForOverlay,
          result: overlayResultFromApi(matchData.result),
        })
      } catch (error) {
        if (!cancelled) {
          setOverlayLoadError(captureErrorMessage(error, 'Не удалось обновить данные игрока.'))
        }
      }
    }

    const bootstrap = async () => {
      try {
        const playerPayload = await player(nickname, analyticsSource)
        if (cancelled) return
        playerId = typeof playerPayload.playerId === 'string' ? playerPayload.playerId : null
        if (!playerId) {
          setOverlayLoadError('Игрок не найден. Проверьте никнейм FACEIT.')
          return
        }
        lastKnownElo =
          typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null
        const initialLevel = typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null
        lastKnownLevel = initialLevel

        const matchData = await lastMatch(playerId, analyticsSource)
        if (cancelled) return
        if (matchData.matchId) {
          lastMatchId = matchData.matchId
        }
        if (matchData.matchId && typeof lastKnownElo === 'number') {
          publishMatch({
            elo: lastKnownElo,
            skillLevel: initialLevel,
            result: overlayResultFromApi(matchData.result),
          })
        }

        pollTimer = window.setInterval(() => void pollLastMatch(), pollMs)
      } catch (error) {
        if (!cancelled) {
          setOverlayLoadError(captureErrorMessage(error, 'Не удалось загрузить игрока.'))
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(resetLoadErrorRaf)
      if (pollTimer) window.clearInterval(pollTimer)
      window.requestAnimationFrame(() => {
        setOverlayMatch(null)
      })
    }
  }, [
    isTestMode,
    location.search,
    nickname,
    rawNickname,
    rawTest,
    searchParams,
    setSearchParams,
  ])

  const blockingMessage = missingNicknameMessage ?? overlayLoadError

  return (
    <div className='overlay-page'>
      {blockingMessage ? (
        <div className='overlay-page__error-screen'>
          <div className='overlay-page__error-title'>Упс, не нашли такого игрока</div>
          <div className='overlay-page__error-message'>{blockingMessage}</div>
        </div>
      ) : (
        <WidgetOverlay match={overlayMatch}/>
      )}
    </div>
  )
}
