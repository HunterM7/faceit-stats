import { useEffect, useState } from 'react';
import { OVERLAY_TEST_FLOW } from './overlay-test-flow';
import type { MatchResult } from './widget-overlay';
import {
  OVERLAY_TEST_PAUSE_MS,
  WIDGET_OVERLAY_HIDE_AFTER_ANIMATION_MS,
} from './widget-overlay-timing';

export function useOverlayTestMatchCycle(enabled: boolean): MatchResult | null {
  const [ match, setMatch ] = useState<MatchResult | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let showTimer: number | null = null;
    let hideTimer: number | null = null;
    let flowIndex = 0;

    const schedule = () => {
      const flowMatch = OVERLAY_TEST_FLOW[flowIndex % OVERLAY_TEST_FLOW.length];
      flowIndex += 1;

      setMatch({
        elo: flowMatch.after.elo,
        skillLevel: flowMatch.after.skillLevel,
        result: flowMatch.result,
      });

      hideTimer = window.setTimeout(() => {
        hideTimer = null;
        showTimer = window.setTimeout(schedule, OVERLAY_TEST_PAUSE_MS);
      }, WIDGET_OVERLAY_HIDE_AFTER_ANIMATION_MS);
    };

    showTimer = window.setTimeout(schedule, 0);

    return () => {
      if (showTimer) {
        window.clearTimeout(showTimer);
      }
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, [ enabled ]);

  return enabled ? match : null;
}
