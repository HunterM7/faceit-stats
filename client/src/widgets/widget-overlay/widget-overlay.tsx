import { useCallback, useEffect, useRef, useState } from 'react'
import { WidgetOverlayLevelIcon } from './widget-overlay-level-icon/widget-overlay-level-icon'
import { WidgetOverlayParticles } from './widget-overlay-particles/widget-overlay-particles'
import './widget-overlay.scss'
import { classNames } from '@/utils/classNames';

/** Текущие ELO / уровень / исход после матча; родитель подставляет актуальные значения с API. */
export interface WidgetOverlayMatch {
  elo: number;
  level: number | null;
  result: 'WIN' | 'LOSS';
}

export interface WidgetOverlayProps {
  /**
   * Первое значение после сброса — только выставить цифры без оверлея.
   * Дальше при смене `elo` относительно предыдущего принятого снимка — анимация.
   */
  match: WidgetOverlayMatch | null;
  errorMessage?: string | null;
}

type EloOverlayTick =
  | { kind: 'static'; elo: number | null; delta: number | null; level: number | null }
  | {
    kind: 'tween';
    fromElo: number;
    toElo: number;
    delta: number;
    fromLevel: number | null;
    toLevel: number | null;
  }

export function WidgetOverlay(props: WidgetOverlayProps) {
  const { match, errorMessage = null } = props
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

  const eloAnimationFrameRef = useRef<number | null>(null)
  const eloAnimationDelayTimeoutRef = useRef<number | null>(null)
  const eloAnimationStartTimeoutRef = useRef<number | null>(null)
  const hideOverlayTimerRef = useRef<number | null>(null)
  const lastEloRef = useRef<number | null>(null)
  const lastLevelRef = useRef<number | null>(null)
  const lastResultRef = useRef<'WIN' | 'LOSS'>('WIN')

  const runEloOverlaySequence = useCallback((tick: EloOverlayTick) => {
    if (eloAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(eloAnimationFrameRef.current)
      eloAnimationFrameRef.current = null
    }
    if (eloAnimationDelayTimeoutRef.current !== null) {
      window.clearTimeout(eloAnimationDelayTimeoutRef.current)
      eloAnimationDelayTimeoutRef.current = null
    }
    if (eloAnimationStartTimeoutRef.current !== null) {
      window.clearTimeout(eloAnimationStartTimeoutRef.current)
      eloAnimationStartTimeoutRef.current = null
    }

    if (tick.kind === 'static') {
      setEloDisplay(tick.elo)
      setDeltaDisplay(tick.delta)
      setIsDeltaVisible(typeof tick.delta === 'number')
      setLevel(tick.level)
      return
    }

    const { fromElo, toElo, delta, fromLevel, toLevel } = tick
    const diff = toElo - fromElo
    const durationMs = counterDurationMs

    setEloDisplay(fromElo)
    setDeltaDisplay(delta)
    setIsDeltaVisible(false)
    setLevel(fromLevel)

    const step = (startTime: number, now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs)
      const eased = 1 - ((1 - progress) ** 3)
      setEloDisplay(Math.round(fromElo + (diff * eased)))
      setDeltaDisplay(Math.round(delta * (1 - eased)))

      if (progress < 1) {
        eloAnimationFrameRef.current = window.requestAnimationFrame((frameNow) => step(startTime, frameNow))
      } else {
        setDeltaDisplay(0)
        eloAnimationFrameRef.current = null
      }
    }

    eloAnimationDelayTimeoutRef.current = window.setTimeout(() => {
      setIsDeltaVisible(true)
      eloAnimationStartTimeoutRef.current = window.setTimeout(() => {
        eloAnimationStartTimeoutRef.current = null
        setLevel(toLevel ?? fromLevel)
        const animationStart = performance.now()
        eloAnimationFrameRef.current = window.requestAnimationFrame((frameNow) => step(animationStart, frameNow))
      }, deltaLeadInMs)
      eloAnimationDelayTimeoutRef.current = null
    }, previewMs)
  }, [ counterDurationMs, deltaLeadInMs, previewMs ])

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideOverlayTimerRef.current !== null) {
        window.clearTimeout(hideOverlayTimerRef.current)
        hideOverlayTimerRef.current = null
      }
    }

    const applyQuietSnapshot = (next: WidgetOverlayMatch) => {
      lastEloRef.current = next.elo
      lastLevelRef.current = next.level
      lastResultRef.current = next.result
      setResult(next.result)
      runEloOverlaySequence({
        kind: 'static',
        elo: next.elo,
        delta: null,
        level: next.level,
      })
    }

    let cancelled = false
    const frameId = window.requestAnimationFrame(() => {
      if (cancelled) {
        return
      }

      if (errorMessage) {
        clearHideTimer()
        setVisible(false)
        return
      }

      clearHideTimer()

      if (!match) {
        lastEloRef.current = null
        lastLevelRef.current = null
        setVisible(false)
        return
      }

      if (
        lastEloRef.current !== null
        && match.elo === lastEloRef.current
        && match.level === lastLevelRef.current
        && match.result === lastResultRef.current
      ) {
        return
      }

      if (lastEloRef.current === null) {
        applyQuietSnapshot(match)
        setVisible(false)
        return
      }

      if (match.elo === lastEloRef.current) {
        applyQuietSnapshot(match)
        return
      }

      const fromElo = lastEloRef.current
      const fromLevel = lastLevelRef.current
      lastEloRef.current = match.elo
      lastLevelRef.current = match.level
      lastResultRef.current = match.result

      const signedDelta = match.elo - fromElo
      setResult(match.result)
      runEloOverlaySequence({
        kind: 'tween',
        fromElo,
        toElo: match.elo,
        delta: signedDelta,
        fromLevel,
        toLevel: match.level,
      })
      setBurstSeed(Date.now())
      setVisible(true)
      hideOverlayTimerRef.current = window.setTimeout(() => {
        hideOverlayTimerRef.current = null
        setVisible(false)
      }, hideAfterAnimationMs)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frameId)
      clearHideTimer()
    }
  }, [ errorMessage, hideAfterAnimationMs, match, runEloOverlaySequence ])

  useEffect(() => {
    return () => {
      if (eloAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(eloAnimationFrameRef.current)
      }
      if (eloAnimationDelayTimeoutRef.current !== null) {
        window.clearTimeout(eloAnimationDelayTimeoutRef.current)
      }
      if (eloAnimationStartTimeoutRef.current !== null) {
        window.clearTimeout(eloAnimationStartTimeoutRef.current)
      }
      if (hideOverlayTimerRef.current !== null) {
        window.clearTimeout(hideOverlayTimerRef.current)
      }
    }
  }, [])

  const isMatchResultVisible = visible && !errorMessage
  let eloDeltaText = '--'
  if (typeof deltaDisplay === 'number') {
    const absDelta = Math.abs(deltaDisplay)
    eloDeltaText = result === 'LOSS' ? `-${absDelta}` : `+${absDelta}`
  }

  return (
    <div className='widget-overlay'>
      {errorMessage ? (
        <div className='widget-overlay__error-screen'>
          <div className='widget-overlay__error-title'>Упс, не нашли такого игрока</div>
          <div className='widget-overlay__error-message'>{errorMessage}</div>
        </div>
      ) : null}

      <div className={`widget-overlay__stage ${isMatchResultVisible ? 'widget-overlay__stage--show' : 'widget-overlay__stage--hidden'}`}>
        <WidgetOverlayParticles burstKey={burstSeed} result={result}/>
        <div
          key={burstSeed}
          className={classNames('widget-overlay__notice', result == 'LOSS' ? 'widget-overlay__notice--loss' : 'widget-overlay__notice--win')}
        >
          <WidgetOverlayLevelIcon level={level} result={result}/>
          <div className='widget-overlay__elo'>{eloDisplay ?? '--'} ELO</div>
          <div className={`${result === 'LOSS' ? 'widget-overlay__delta widget-overlay__delta--negative' : 'widget-overlay__delta widget-overlay__delta--positive'} ${isDeltaVisible ? 'widget-overlay__delta--show' : 'widget-overlay__delta--hidden'}`}>
            {eloDeltaText} ELO
          </div>
        </div>
      </div>
    </div>
  )
}
