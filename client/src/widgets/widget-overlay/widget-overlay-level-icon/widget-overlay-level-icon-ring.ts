import { WIDGET_OVERLAY_COUNTER_DURATION_MS } from '../widget-overlay-timing';

/** Геометрия кольца как в FACEIT (viewBox 24×24): разрыв по центру внизу, заполнение по часовой. */
const RING_RADIUS = 9.6;
/** Ширина разрыва внизу (как в skill-level-*.svg). */
const RING_GAP_DEG = 58;
const RING_ROTATE_DEG = 90 + RING_GAP_DEG / 2;

function ringCircumference(): number {
  return 2 * Math.PI * RING_RADIUS;
}

export function widgetOverlayLevelIconRing(level: number | null): {
  trackDasharray: string;
  progressDasharray: string;
} {
  const circumference = ringCircumference();
  const gap = circumference * (RING_GAP_DEG / 360);
  const track = circumference - gap;
  const clamped = level == null ? 0 : Math.min(10, Math.max(0, level));
  const fill = (clamped / 10) * track;

  return {
    trackDasharray: `${track} ${gap}`,
    progressDasharray: `${fill} ${circumference - fill}`,
  };
}

export const WIDGET_OVERLAY_LEVEL_ICON_RING_VIEW = {
  cx: 12,
  cy: 12,
  r: RING_RADIUS,
  transform: `rotate(${RING_ROTATE_DEG} 12 12)`,
} as const;

export const WIDGET_OVERLAY_LEVEL_ICON_RING_FILL_MS = WIDGET_OVERLAY_COUNTER_DURATION_MS;
export const WIDGET_OVERLAY_LEVEL_ICON_CORE_PULSE_MS = 720;
