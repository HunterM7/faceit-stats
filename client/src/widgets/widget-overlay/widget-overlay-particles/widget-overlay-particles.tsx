import { useMemo, type CSSProperties } from 'react'
import { classNames } from '@/utils/classNames'
import { buildOverlayBurstParticles } from '../utils/overlay-particles'
import './widget-overlay-particles.scss'

export interface WidgetOverlayParticlesProps {
  /** Меняется при каждом новом показе матча — пересборка частиц и id для спанов. */
  burstKey: number;
  result: 'WIN' | 'LOSS';
}

export function WidgetOverlayParticles(props: WidgetOverlayParticlesProps) {
  const { burstKey, result } = props

  const particles = useMemo(() => buildOverlayBurstParticles(burstKey), [ burstKey ])

  return (
    <div
      className={classNames(
        'widget-overlay-particles',
        result === 'LOSS' ? 'widget-overlay-particles--loss' : 'widget-overlay-particles--win',
      )}
    >
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
          <span key={particle.id} className='widget-overlay-particles__particle' style={particleStyle} aria-hidden='true'>
            <svg className='widget-overlay-particles__icon' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M21 4.134c0-.143-.17-.18-.238-.071-2.177 3.553-3.436 5.563-4.525 7.429H3.174c-.17 0-.238.215-.102.287 5.41 2.153 13.233 5.42 17.622 7.214.102.036.306-.072.306-.144V4.134z' fill='currentColor'/>
            </svg>
          </span>
        )
      })}
    </div>
  )
}
