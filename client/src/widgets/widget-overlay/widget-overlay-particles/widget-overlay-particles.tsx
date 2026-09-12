import { useMemo, type CSSProperties } from 'react';
import { buildOverlayBurstParticles } from '../utils/overlay-particles';
import './widget-overlay-particles.scss';

export interface WidgetOverlayParticlesProps {
  /** Меняется при каждом новом показе матча — пересборка частиц и id для спанов. */
  burstKey: number;
}

export function WidgetOverlayParticles(props: WidgetOverlayParticlesProps) {
  const { burstKey } = props;

  const particles = useMemo(() => buildOverlayBurstParticles(burstKey), [ burstKey ]);

  return (
    <div className='widget-overlay-particles'>
      {particles.map((particle) => {
        const particleStyle = {
          '--particle-x': `${particle.xCqw.toFixed(2)}cqw`,
          '--particle-y': `${particle.yCqh.toFixed(2)}cqh`,
          '--particle-delay': `${Math.round(particle.delayMs)}ms`,
          '--particle-duration': `${Math.round(particle.durationMs)}ms`,
          '--particle-scale': particle.scale.toFixed(2),
          '--particle-pulse-duration': `${Math.round(particle.pulseDurationMs)}ms`,
          '--particle-pulse-delay': `${Math.round(particle.pulseDelayMs)}ms`,
          '--particle-pulse-scale': particle.pulseScale.toFixed(2),
        } as CSSProperties;

        return (
          <span key={particle.id} className='widget-overlay-particles__particle' style={particleStyle}>
            <svg className='widget-overlay-particles__icon' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M12 4v16M4 12h16' stroke='currentColor' strokeWidth='1.5'/>
            </svg>
          </span>
        );
      })}
    </div>
  );
}
