import { useEffect, useRef, useState } from 'react'
import { classNames } from '@/utils/classNames'
import './widget-overlay-level-icon.scss'

export interface WidgetOverlayLevelIconProps {
  /** Сырой уровень из API; `null`, если `currentSkillLevel` не пришёл — в разметке показываем `--`. */
  level: number | null;
  result: 'WIN' | 'LOSS';
}

export function WidgetOverlayLevelIcon(props: WidgetOverlayLevelIconProps) {
  const { level, result } = props

  const prevLevelRef = useRef<number | null>(null)
  const [ pulseNonce, setPulseNonce ] = useState(0)

  useEffect(() => {
    const prev = prevLevelRef.current
    prevLevelRef.current = level

    if (prev === null || level === null || prev === level) {
      return
    }

    setPulseNonce((n) => n + 1)
  }, [ level ])

  return (
    <div
      key={pulseNonce}
      className={classNames(
        'widget-overlay-level-icon',
        pulseNonce > 0 && (result === 'LOSS' ? 'widget-overlay-level-icon--pulse-down' : 'widget-overlay-level-icon--pulse-up'),
      )}
      aria-hidden='true'
    >
      <span
        className={classNames(
          'widget-overlay-level-icon__ring',
          result === 'LOSS' ? 'widget-overlay-level-icon__ring--loss' : 'widget-overlay-level-icon__ring--win',
        )}
      />
      <span
        className={classNames(
          'widget-overlay-level-icon__core',
          result === 'LOSS' ? 'widget-overlay-level-icon__core--loss' : 'widget-overlay-level-icon__core--win',
        )}
      >
        {level ?? '--'}
      </span>
    </div>
  )
}
