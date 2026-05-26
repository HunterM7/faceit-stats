import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { WidgetOverlayLevelIcon } from './widget-overlay-level-icon/widget-overlay-level-icon';
import { WidgetOverlayParticles } from './widget-overlay-particles/widget-overlay-particles';
import './widget-overlay.scss';
import { classNames } from '@/utils/classNames';
import {
  WIDGET_OVERLAY_COUNTER_DURATION_MS,
  WIDGET_OVERLAY_DELTA_LEAD_IN_MS,
  WIDGET_OVERLAY_HIDE_AFTER_ANIMATION_MS,
  WIDGET_OVERLAY_PREVIEW_MS,
} from './widget-overlay-timing';

/** Параметры матча. */
interface Match {
  /** Уровень ELO игрока на момент матча. */
  elo: number;
  /** Уровень мастерства игрока на момент матча. */
  skillLevel: number;
}

/** Параметры метода `showMatchResult`. */
interface ShowMatchResultParams {
  /** Параметры предыдущего матча. */
  previous?: Match | undefined;
  /** Параметры текущего матча. */
  current?: Match | undefined;
  /** Исход матча. */
  result: 'WIN' | 'LOSS';
}

interface Ref {
  /** Запускает анимацию результатов последнего матча (победа/поражение). */
  showMatchResult(params: ShowMatchResultParams): void;
}

type OverlayDisplayMode = 'stats' | 'result-label';

type EloOverlayTick =
  | { kind: 'static'; elo: number | null; delta: number | null; skillLevel: number | null }
  | {
    kind: 'tween';
    fromElo: number;
    toElo: number;
    delta: number;
    fromLevel: number | null;
    toLevel: number | null;
  };

/** Виджет-оверлей с показом результатов последнего матча. */
export const WidgetOverlay = forwardRef<Ref>((_props, ref) => {
  const previewMs = WIDGET_OVERLAY_PREVIEW_MS;
  const deltaLeadInMs = WIDGET_OVERLAY_DELTA_LEAD_IN_MS;
  const counterDurationMs = WIDGET_OVERLAY_COUNTER_DURATION_MS;
  const hideAfterAnimationMs = WIDGET_OVERLAY_HIDE_AFTER_ANIMATION_MS;

  const [ visible, setVisible ] = useState(false);
  const [ displayMode, setDisplayMode ] = useState<OverlayDisplayMode>('stats');
  const [ result, setResult ] = useState<'WIN' | 'LOSS'>('WIN');
  const [ skillLevel, setSkillLevel ] = useState<number | null>(null);
  const [ eloDisplay, setEloDisplay ] = useState<number | null>(null);
  const [ deltaDisplay, setDeltaDisplay ] = useState<number | null>(null);
  const [ isDeltaVisible, setIsDeltaVisible ] = useState(false);
  const [ burstSeed, setBurstSeed ] = useState(0);

  const eloAnimationFrameRef = useRef<number | null>(null);
  const eloAnimationDelayTimeoutRef = useRef<number | null>(null);
  const eloAnimationStartTimeoutRef = useRef<number | null>(null);
  const hideOverlayTimerRef = useRef<number | null>(null);

  const clearAllTimersAndRaf = useCallback(() => {
    if (eloAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(eloAnimationFrameRef.current);
      eloAnimationFrameRef.current = null;
    }
    if (eloAnimationDelayTimeoutRef.current !== null) {
      window.clearTimeout(eloAnimationDelayTimeoutRef.current);
      eloAnimationDelayTimeoutRef.current = null;
    }
    if (eloAnimationStartTimeoutRef.current !== null) {
      window.clearTimeout(eloAnimationStartTimeoutRef.current);
      eloAnimationStartTimeoutRef.current = null;
    }
    if (hideOverlayTimerRef.current !== null) {
      window.clearTimeout(hideOverlayTimerRef.current);
      hideOverlayTimerRef.current = null;
    }
  }, []);

  const runEloOverlaySequence = useCallback((tick: EloOverlayTick) => {
    if (tick.kind === 'static') {
      setEloDisplay(tick.elo);
      setDeltaDisplay(tick.delta);
      setIsDeltaVisible(typeof tick.delta === 'number');
      setSkillLevel(tick.skillLevel);
      return;
    }

    const { fromElo, toElo, delta, fromLevel, toLevel } = tick;
    const diff = toElo - fromElo;
    const durationMs = counterDurationMs;

    setEloDisplay(fromElo);
    setDeltaDisplay(delta);
    setIsDeltaVisible(false);
    setSkillLevel(fromLevel);

    const step = (startTime: number, now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - ((1 - progress) ** 3);
      setEloDisplay(Math.round(fromElo + (diff * eased)));
      setDeltaDisplay(Math.round(delta * (1 - eased)));

      if (progress < 1) {
        eloAnimationFrameRef.current = window.requestAnimationFrame((frameNow) => step(startTime, frameNow));
      } else {
        setDeltaDisplay(0);
        eloAnimationFrameRef.current = null;
      }
    };

    eloAnimationDelayTimeoutRef.current = window.setTimeout(() => {
      setIsDeltaVisible(true);
      eloAnimationStartTimeoutRef.current = window.setTimeout(() => {
        eloAnimationStartTimeoutRef.current = null;
        setSkillLevel(toLevel ?? fromLevel);
        const animationStart = performance.now();
        eloAnimationFrameRef.current = window.requestAnimationFrame((frameNow) => step(animationStart, frameNow));
      }, deltaLeadInMs);
      eloAnimationDelayTimeoutRef.current = null;
    }, previewMs);
  }, [ counterDurationMs, deltaLeadInMs, previewMs ]);

  const showMatchResult = useCallback(
    ({ previous, current, result: nextResult }: ShowMatchResultParams) => {
      clearAllTimersAndRaf();

      setResult(nextResult);
      setBurstSeed(Date.now());

      if (current === undefined || previous === undefined) {
        setDisplayMode('result-label');
        setVisible(true);
        hideOverlayTimerRef.current = window.setTimeout(() => {
          hideOverlayTimerRef.current = null;
          setVisible(false);
        }, hideAfterAnimationMs);
        return;
      }

      setDisplayMode('stats');

      const signedDelta = current.elo - previous.elo;
      runEloOverlaySequence({
        kind: 'tween',
        fromElo: previous.elo,
        toElo: current.elo,
        delta: signedDelta,
        fromLevel: previous.skillLevel,
        toLevel: current.skillLevel,
      });

      setVisible(true);
      hideOverlayTimerRef.current = window.setTimeout(() => {
        hideOverlayTimerRef.current = null;
        setVisible(false);
      }, hideAfterAnimationMs);
    },
    [ clearAllTimersAndRaf, hideAfterAnimationMs, runEloOverlaySequence ],
  );

  useImperativeHandle(ref, () => ({
    showMatchResult,
  }), [ showMatchResult ]);

  useEffect(() => {
    return () => {
      clearAllTimersAndRaf();
    };
  }, [ clearAllTimersAndRaf ]);

  let eloDeltaText = '--';
  if (typeof deltaDisplay === 'number') {
    const absDelta = Math.abs(deltaDisplay);
    eloDeltaText = result === 'LOSS' ? `-${absDelta}` : `+${absDelta}`;
  }

  return (
    <div className='widget-overlay'>
      <div className={`widget-overlay__stage ${visible ? 'widget-overlay__stage--show' : 'widget-overlay__stage--hidden'}`}>
        <WidgetOverlayParticles burstKey={burstSeed} result={result}/>
        <div
          key={burstSeed}
          className={classNames('widget-overlay__notice', result == 'LOSS' ? 'widget-overlay__notice--loss' : 'widget-overlay__notice--win')}
        >
          <div className='widget-overlay__anchor'>
            {displayMode === 'result-label' ? (
              <div className={classNames(
                'widget-overlay__result-label',
                result === 'LOSS' ? 'widget-overlay__result-label--loss' : 'widget-overlay__result-label--win',
              )}>
                {result === 'LOSS' ? 'Поражение' : 'Победа'}
              </div>
            ) : (
              <>
                <div className='widget-overlay__elo'>{eloDisplay ?? '--'} ELO</div>
                <div className='widget-overlay__level'>
                  <WidgetOverlayLevelIcon skillLevel={skillLevel} result={result}/>
                </div>
                <div className={`${result === 'LOSS' ? 'widget-overlay__delta widget-overlay__delta--negative' : 'widget-overlay__delta widget-overlay__delta--positive'} ${isDeltaVisible ? 'widget-overlay__delta--show' : 'widget-overlay__delta--hidden'}`}>
                  {eloDeltaText} ELO
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
