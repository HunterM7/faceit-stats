import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { lastMatch, player } from '@/requests/matchResult'
import { WidgetOverlay, type WidgetOverlayMatch } from '@widgets/widget-overlay/widget-overlay'

interface OverlayTestMatch {
  before: {
    level: number;
    elo: number;
  };
  after: {
    level: number;
    elo: number;
  };
  result: 'WIN' | 'LOSS';
}

const TEST_MATCH_FLOW: OverlayTestMatch[] = [
  { before: { level: 7, elo: 1528 }, after: { level: 8, elo: 1553 }, result: 'WIN' },
  { before: { level: 8, elo: 1553 }, after: { level: 7, elo: 1529 }, result: 'LOSS' },
  { before: { level: 7, elo: 1529 }, after: { level: 8, elo: 1552 }, result: 'WIN' },
  { before: { level: 8, elo: 1552 }, after: { level: 7, elo: 1530 }, result: 'LOSS' },
  { before: { level: 7, elo: 1530 }, after: { level: 8, elo: 1560 }, result: 'WIN' },
  { before: { level: 8, elo: 1560 }, after: { level: 8, elo: 1531 }, result: 'LOSS' },
  { before: { level: 8, elo: 1531 }, after: { level: 7, elo: 1510 }, result: 'LOSS' },
  { before: { level: 7, elo: 1510 }, after: { level: 8, elo: 1538 }, result: 'WIN' },
  { before: { level: 8, elo: 1538 }, after: { level: 7, elo: 1511 }, result: 'LOSS' },
  { before: { level: 7, elo: 1511 }, after: { level: 8, elo: 1537 }, result: 'WIN' },
  { before: { level: 8, elo: 1537 }, after: { level: 7, elo: 1512 }, result: 'LOSS' },
  { before: { level: 7, elo: 1512 }, after: { level: 8, elo: 1536 }, result: 'WIN' },
  { before: { level: 8, elo: 1536 }, after: { level: 7, elo: 1513 }, result: 'LOSS' },
  { before: { level: 7, elo: 1513 }, after: { level: 8, elo: 1535 }, result: 'WIN' },
  { before: { level: 8, elo: 1535 }, after: { level: 7, elo: 1505 }, result: 'LOSS' },
  { before: { level: 7, elo: 1505 }, after: { level: 8, elo: 1534 }, result: 'WIN' },
  { before: { level: 8, elo: 1534 }, after: { level: 7, elo: 1506 }, result: 'LOSS' },
  { before: { level: 7, elo: 1506 }, after: { level: 8, elo: 1533 }, result: 'WIN' },
  { before: { level: 8, elo: 1533 }, after: { level: 7, elo: 1507 }, result: 'LOSS' },
  { before: { level: 7, elo: 1507 }, after: { level: 7, elo: 1528 }, result: 'WIN' },
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

  const [ overlayMatch, setOverlayMatch ] = useState<WidgetOverlayMatch | null>(null)

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
          level: flowMatch.after.level,
          result: flowMatch.result,
        })

        hideTimer = window.setTimeout(() => {
          hideTimer = null
          showTimer = window.setTimeout(schedule, testPauseMs)
        }, hideAfterAnimationMs)
      }

      showTimer = window.setTimeout(schedule, 0)
      return () => {
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

    const publishMatch = (payload: WidgetOverlayMatch) => {
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
          level: nextLevelForOverlay,
          result: overlayResultFromApi(matchData.result),
        })
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
            level: initialLevel,
            result: overlayResultFromApi(matchData.result),
          })
        }

        pollTimer = window.setInterval(() => void pollLastMatch(), pollMs)
      } catch (error) {
        console.error('[bootstrap lastMatch flow failed]', error)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
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

  return (
    <WidgetOverlay match={overlayMatch} errorMessage={missingNicknameMessage}/>
  )
}
