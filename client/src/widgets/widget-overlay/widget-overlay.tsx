import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { lastMatch, player } from '@/requests/matchResult'
import './widget-overlay.scss'

interface OverlayParticle {
  id: string;
  xVw: number;
  yVh: number;
  delayMs: number;
  durationMs: number;
  scale: number;
  pulseDurationMs: number;
  pulseDelayMs: number;
  pulseScale: number;
}

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

const GRID_COLUMNS: number = 24
const GRID_ROWS: number = 14
const GRID_SPREAD_X_VW: number = 48
const GRID_SPREAD_Y_VH: number = 46

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

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min

const buildParticles = (seed: number): OverlayParticle[] => {
  const particles: OverlayParticle[] = []
  let index = 0

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const rowProgress = GRID_ROWS === 1 ? 0.5 : row / (GRID_ROWS - 1)
    const yVh = (rowProgress - 0.5) * GRID_SPREAD_Y_VH * 2

    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const columnProgress = GRID_COLUMNS === 1 ? 0.5 : column / (GRID_COLUMNS - 1)
      const xVw = (columnProgress - 0.5) * GRID_SPREAD_X_VW * 2
      const centerMask = Math.abs(xVw) < 5 && Math.abs(yVh) < 3
      if (centerMask) continue

      const distance = Math.hypot(xVw / GRID_SPREAD_X_VW, yVh / GRID_SPREAD_Y_VH)
      const delayMs = 70 + (distance * 460) + getRandom(0, 55)

      particles.push({
        id: `${seed}-${index}`,
        xVw,
        yVh,
        delayMs,
        durationMs: 950 + getRandom(0, 220),
        scale: 1,
        pulseDurationMs: getRandom(720, 1400),
        pulseDelayMs: delayMs + getRandom(460, 900),
        pulseScale: getRandom(1.16, 1.38),
      })
      index += 1
    }
  }

  return particles
}

export function WidgetOverlay() {
  const analyticsSource = 'overlay_widget'
  const pollMs = 5000
  const testPauseMs = 3000
  const previewMs = 2000
  const deltaLeadInMs = 1000
  const counterDurationMs = 1400
  const zeroHoldMs = 1000
  const hideAfterAnimationMs = previewMs + deltaLeadInMs + counterDurationMs + zeroHoldMs
  const [ visible, setVisible ] = useState(false)
  const [ result, setResult ] = useState<'WIN' | 'LOSS'>('WIN')
  const [ level, setLevel ] = useState<number | null>(null)
  const [ eloDisplay, setEloDisplay ] = useState<number | null>(null)
  const [ deltaDisplay, setDeltaDisplay ] = useState<number | null>(null)
  const [ isDeltaVisible, setIsDeltaVisible ] = useState(false)
  const [ burstSeed, setBurstSeed ] = useState(0)
  const [ levelPulseDirection, setLevelPulseDirection ] = useState<'up' | 'down' | null>(null)
  const [ levelPulseKey, setLevelPulseKey ] = useState(0)
  const eloAnimationFrameRef = useRef<number | null>(null)
  const eloAnimationDelayTimeoutRef = useRef<number | null>(null)
  const currentEloRef = useRef<number | null>(null)
  const currentLevelRef = useRef<number | null>(null)
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const rawNickname = searchParams.get('nickname')
  const rawTest = searchParams.get('test')
  const isTestMode = rawTest === 'true'
  const nickname = rawNickname?.trim() ?? ''
  const missingNicknameMessage = !isTestMode && !nickname
    ? 'Похоже, что ты не указал свой FACEIT-ник. Добавь его в адресной строке после nickname='
    : null

  const animateEloCounters = (nextElo: number | null, nextDelta: number | null, nextLevel: number | null) => {
    const beforeLevel = currentLevelRef.current

    if (eloAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(eloAnimationFrameRef.current)
      eloAnimationFrameRef.current = null
    }
    if (eloAnimationDelayTimeoutRef.current !== null) {
      window.clearTimeout(eloAnimationDelayTimeoutRef.current)
      eloAnimationDelayTimeoutRef.current = null
    }

    if (typeof nextElo !== 'number' || typeof nextDelta !== 'number') {
      setEloDisplay(nextElo)
      setDeltaDisplay(nextDelta)
      setIsDeltaVisible(typeof nextDelta === 'number')
      setLevel(nextLevel ?? beforeLevel)
      setLevelPulseDirection(null)
      return
    }

    const from = nextElo - nextDelta
    const to = nextElo
    const diff = to - from
    const previewMs = 2000
    const durationMs = counterDurationMs

    setEloDisplay(from)
    setDeltaDisplay(nextDelta)
    setIsDeltaVisible(false)
    setLevel(beforeLevel)

    const animate = (startTime: number, now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs)
      const eased = 1 - ((1 - progress) ** 3)
      const nextEloDisplay = Math.round(from + (diff * eased))
      const nextDeltaDisplay = Math.round(nextDelta * (1 - eased))
      setEloDisplay(nextEloDisplay)
      setDeltaDisplay(nextDeltaDisplay)

      if (progress < 1) {
        eloAnimationFrameRef.current = window.requestAnimationFrame((frameNow) => animate(startTime, frameNow))
      } else {
        setDeltaDisplay(0)
        eloAnimationFrameRef.current = null
      }
    }

    eloAnimationDelayTimeoutRef.current = window.setTimeout(() => {
      setIsDeltaVisible(true)
      window.setTimeout(() => {
        if (typeof beforeLevel === 'number' && typeof nextLevel === 'number' && nextLevel !== beforeLevel) {
          setLevelPulseDirection(nextLevel > beforeLevel ? 'up' : 'down')
          setLevelPulseKey((prev) => prev + 1)
        } else {
          setLevelPulseDirection(null)
        }
        setLevel(nextLevel ?? beforeLevel)
        const animationStart = performance.now()
        eloAnimationFrameRef.current = window.requestAnimationFrame((frameNow) => animate(animationStart, frameNow))
      }, deltaLeadInMs)
      eloAnimationDelayTimeoutRef.current = null
    }, previewMs)
  }

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
        const match = TEST_MATCH_FLOW[flowIndex % TEST_MATCH_FLOW.length]
        flowIndex += 1
        const signedDelta = match.after.elo - match.before.elo
        const nextElo = match.after.elo

        // Эмулируем реальный матч: сначала есть состояние ДО матча,
        // затем в виджете проигрывается переход к состоянию ПОСЛЕ.
        currentEloRef.current = match.before.elo

        setResult(match.result)
        currentLevelRef.current = match.before.level
        currentEloRef.current = nextElo
        animateEloCounters(nextElo, signedDelta, match.after.level)
        currentLevelRef.current = match.after.level
        setBurstSeed(Date.now())
        setVisible(true)

        hideTimer = window.setTimeout(() => {
          setVisible(false)
          showTimer = window.setTimeout(schedule, testPauseMs)
        }, hideAfterAnimationMs)
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
      const beforeLevel = currentLevelRef.current
      currentLevelRef.current = nextLevel ?? beforeLevel
      if (typeof nextElo === 'number') {
        currentEloRef.current = nextElo
      }
      animateEloCounters(nextElo, nextEloDelta, nextLevel)
      setBurstSeed(Date.now())
      setVisible(true)
      if (hideTimer) window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => setVisible(false), hideAfterAnimationMs)
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
        const initialLevel = typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null
        setLevel(initialLevel)
        currentLevelRef.current = initialLevel
        currentEloRef.current = lastKnownElo
        animateEloCounters(lastKnownElo, null, initialLevel)

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
  }, [
    counterDurationMs,
    deltaLeadInMs,
    hideAfterAnimationMs,
    isTestMode,
    location.search,
    nickname,
    previewMs,
    rawNickname,
    rawTest,
    searchParams,
    setSearchParams,
    testPauseMs,
  ])

  useEffect(() => {
    return () => {
      if (eloAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(eloAnimationFrameRef.current)
      }
      if (eloAnimationDelayTimeoutRef.current !== null) {
        window.clearTimeout(eloAnimationDelayTimeoutRef.current)
      }
    }
  }, [])

  const isMatchResultVisible = visible && !missingNicknameMessage
  const particles = useMemo(() => buildParticles(burstSeed), [ burstSeed ])
  let eloDeltaText = '--'
  if (typeof deltaDisplay === 'number') {
    const absDelta = Math.abs(deltaDisplay)
    eloDeltaText = result === 'LOSS' ? `-${absDelta}` : `+${absDelta}`
  }

  return (
    <div className='widget-overlay'>
      {missingNicknameMessage ? (
        <div className='widget-overlay__error-screen'>
          <div className='widget-overlay__error-title'>Упс, не нашли такого игрока</div>
          <div className='widget-overlay__error-message'>{missingNicknameMessage}</div>
        </div>
      ) : null}

      <div className={`widget-overlay__stage ${isMatchResultVisible ? 'widget-overlay__stage--show' : 'widget-overlay__stage--hidden'}`}>
        <div className={`widget-overlay__particles ${result === 'LOSS' ? 'widget-overlay__particles--loss' : 'widget-overlay__particles--win'}`}>
          {particles.map((particle) => {
            const particleStyle = {
              '--particle-x': `${particle.xVw.toFixed(2)}vw`,
              '--particle-y': `${particle.yVh.toFixed(2)}vh`,
              '--particle-delay': `${Math.round(particle.delayMs)}ms`,
              '--particle-duration': `${Math.round(particle.durationMs)}ms`,
              '--particle-scale': particle.scale.toFixed(2),
              '--particle-pulse-duration': `${Math.round(particle.pulseDurationMs)}ms`,
              '--particle-pulse-delay': `${Math.round(particle.pulseDelayMs)}ms`,
              '--particle-pulse-scale': particle.pulseScale.toFixed(2),
            } as CSSProperties

            return (
              <span key={particle.id} className='widget-overlay__particle' style={particleStyle} aria-hidden='true'>
                <svg className='widget-overlay__particle-icon' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M21 4.134c0-.143-.17-.18-.238-.071-2.177 3.553-3.436 5.563-4.525 7.429H3.174c-.17 0-.238.215-.102.287 5.41 2.153 13.233 5.42 17.622 7.214.102.036.306-.072.306-.144V4.134z' fill='currentColor'/>
                </svg>
              </span>
            )
          })}
        </div>

        <div
          key={burstSeed}
          className={`widget-overlay__notice ${result === 'LOSS' ? 'widget-overlay__notice--loss' : 'widget-overlay__notice--win'}`}
        >
          <div
            key={levelPulseKey}
            className={`widget-overlay__level-icon ${levelPulseDirection === 'up' ? 'widget-overlay__level-icon--pulse-up' : ''} ${levelPulseDirection === 'down' ? 'widget-overlay__level-icon--pulse-down' : ''}`}
            aria-hidden='true'
          >
            <span className={`widget-overlay__level-icon-ring ${result === 'LOSS' ? 'widget-overlay__level-icon-ring--loss' : 'widget-overlay__level-icon-ring--win'}`}/>
            <span className={`widget-overlay__level-icon-core ${result === 'LOSS' ? 'widget-overlay__level-icon-core--loss' : 'widget-overlay__level-icon-core--win'}`}>
              {level ?? '--'}
            </span>
          </div>
          <div className='widget-overlay__elo'>{eloDisplay ?? '--'} ELO</div>
          <div className={`${result === 'LOSS' ? 'widget-overlay__delta widget-overlay__delta--negative' : 'widget-overlay__delta widget-overlay__delta--positive'} ${isDeltaVisible ? 'widget-overlay__delta--show' : 'widget-overlay__delta--hidden'}`}>
            {eloDeltaText} ELO
          </div>
        </div>
      </div>
    </div>
  )
}
