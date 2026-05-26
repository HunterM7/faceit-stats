import { useEffect, useRef, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { widgetOverlaySkillLevelColor } from './widget-overlay-level-icon-colors';
import {
  widgetOverlayLevelIconRing,
  WIDGET_OVERLAY_LEVEL_ICON_CORE_PULSE_MS,
  WIDGET_OVERLAY_LEVEL_ICON_RING_FILL_MS,
  WIDGET_OVERLAY_LEVEL_ICON_RING_VIEW,
} from './widget-overlay-level-icon-ring';
import './widget-overlay-level-icon.scss';

export interface WidgetOverlayLevelIconProps {
  /** Сырой уровень из API; `null`, если `currentSkillLevel` не пришёл — в разметке показываем `--`. */
  skillLevel: number | null;
  result: 'WIN' | 'LOSS';
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

export function WidgetOverlayLevelIcon(props: WidgetOverlayLevelIconProps) {
  const { skillLevel, result, className } = props;

  const prevLevelRef = useRef<number | null>(null);
  const fillAnimFrameRef = useRef<number | null>(null);
  const [ pulseOnCore, setPulseOnCore ] = useState(false);
  const [ fillLevel, setFillLevel ] = useState<number | null>(skillLevel);

  useEffect(() => {
    const prev = prevLevelRef.current;
    prevLevelRef.current = skillLevel;

    if (fillAnimFrameRef.current !== null) {
      window.cancelAnimationFrame(fillAnimFrameRef.current);
      fillAnimFrameRef.current = null;
    }

    if (prev === null || skillLevel === null || prev === skillLevel) {
      setFillLevel(skillLevel);
      return;
    }

    setPulseOnCore(true);
    const pulseTimer = window.setTimeout(() => setPulseOnCore(false), WIDGET_OVERLAY_LEVEL_ICON_CORE_PULSE_MS);

    const from = prev;
    const to = skillLevel;
    const durationMs = WIDGET_OVERLAY_LEVEL_ICON_RING_FILL_MS;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - ((1 - progress) ** 3);
      setFillLevel(from + ((to - from) * eased));

      if (progress < 1) {
        fillAnimFrameRef.current = window.requestAnimationFrame(step);
      } else {
        setFillLevel(to);
        fillAnimFrameRef.current = null;
      }
    };

    fillAnimFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      window.clearTimeout(pulseTimer);
      if (fillAnimFrameRef.current !== null) {
        window.cancelAnimationFrame(fillAnimFrameRef.current);
        fillAnimFrameRef.current = null;
      }
    };
  }, [ skillLevel ]);

  const ring = widgetOverlayLevelIconRing(fillLevel);
  const { cx, cy, r, transform } = WIDGET_OVERLAY_LEVEL_ICON_RING_VIEW;
  const accentColor = widgetOverlaySkillLevelColor(skillLevel);

  return (
    <div className={classNames('widget-overlay-level-icon', className)}>
      <svg className='widget-overlay-level-icon__chart' viewBox='0 0 24 24'>
        <circle className='widget-overlay-level-icon__bg' cx={cx} cy={cy} r='12'/>
        <circle
          className='widget-overlay-level-icon__track'
          cx={cx}
          cy={cy}
          r={r}
          strokeDasharray={ring.trackDasharray}
          strokeDashoffset={0}
          transform={transform}
        />
        {skillLevel != null && (
          <circle
            className='widget-overlay-level-icon__progress'
            cx={cx}
            cy={cy}
            r={r}
            stroke={accentColor}
            strokeDasharray={ring.progressDasharray}
            strokeDashoffset={0}
            transform={transform}
          />
        )}
      </svg>
      <span
        className={classNames(
          'widget-overlay-level-icon__core',
          pulseOnCore && (result === 'LOSS' ? 'widget-overlay-level-icon__core--pulse-down' : 'widget-overlay-level-icon__core--pulse-up'),
        )}
        style={{
          color: accentColor,
          textShadow: `0 2px 8px rgba(0, 0, 0, 0.85), 0 0 24px ${accentColor}`,
        }}
      >
        {skillLevel ?? '--'}
      </span>
    </div>
  );
}
