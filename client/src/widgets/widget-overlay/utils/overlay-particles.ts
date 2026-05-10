export interface OverlayParticle {
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

const GRID_COLUMNS: number = 24
const GRID_ROWS: number = 14
const GRID_SPREAD_X_VW: number = 48
const GRID_SPREAD_Y_VH: number = 46

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

/** Частицы «взрыва» для оверлея матча; `seed` задаёт стабильные id для React keys. */
export function buildOverlayBurstParticles(seed: number): OverlayParticle[] {
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
      const delayMs = 70 + (distance * 460) + randomInRange(0, 55)

      particles.push({
        id: `${seed}-${index}`,
        xVw,
        yVh,
        delayMs,
        durationMs: 950 + randomInRange(0, 220),
        scale: 1,
        pulseDurationMs: randomInRange(720, 1400),
        pulseDelayMs: delayMs + randomInRange(460, 900),
        pulseScale: randomInRange(1.16, 1.38),
      })
      index += 1
    }
  }

  return particles
}
