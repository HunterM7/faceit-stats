import { useEffect, useState } from 'react';
import { OVERLAY_TEST_FLOW } from './overlay-test-flow';
import type { OverlayMatchResult, OverlayMatchSnapshot } from './overlay-test-flow';
import {
  OVERLAY_TEST_PAUSE_MS,
  WIDGET_OVERLAY_HIDE_AFTER_ANIMATION_MS,
} from './widget-overlay-timing';

/** Текущий шаг демо-цикла для передачи в `WidgetOverlay` через `ref.showMatchResult`. */
export interface OverlayTestCycleValue {
  /** Снимок до шага; `null`, если истории нет. */
  previousMatch: OverlayMatchSnapshot | null;
  /** Снимок после шага; `null` — калибровка без ELO/уровня. */
  match: OverlayMatchResult | null;
  /** Исход шага (в т.ч. при калибровке, когда `match` — `null`). */
  result: OverlayMatchResult['result'];
}

/**
 * Циклически обновляет пару «предыдущий / текущий» матч из `OVERLAY_TEST_FLOW` для предпросмотра и `test=true`.
 * @param enabled — при `false` возвращает `null` и не ставит таймеры.
 */
export function useOverlayTestMatchCycle(enabled: boolean): OverlayTestCycleValue | null {
  const [ cycle, setCycle ] = useState<OverlayTestCycleValue>({
    previousMatch: null,
    match: null,
    result: 'WIN',
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let showTimer: number | null = null;
    let flowIndex = 0;

    const schedule = () => {
      const flowMatch = OVERLAY_TEST_FLOW[flowIndex % OVERLAY_TEST_FLOW.length];
      flowIndex += 1;

      setCycle({
        previousMatch: flowMatch.before
          ? { elo: flowMatch.before.elo, skillLevel: flowMatch.before.skillLevel }
          : null,
        match: flowMatch.after
          ? {
            elo: flowMatch.after.elo,
            skillLevel: flowMatch.after.skillLevel,
            result: flowMatch.result,
          }
          : null,
        result: flowMatch.result,
      });

      showTimer = window.setTimeout(
        schedule,
        WIDGET_OVERLAY_HIDE_AFTER_ANIMATION_MS + OVERLAY_TEST_PAUSE_MS,
      );
    };

    showTimer = window.setTimeout(schedule, 0);

    return () => {
      if (showTimer) {
        window.clearTimeout(showTimer);
      }
      setCycle({ previousMatch: null, match: null, result: 'WIN' });
    };
  }, [ enabled ]);

  return enabled ? cycle : null;
}
