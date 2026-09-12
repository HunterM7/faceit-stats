export interface OverlayParticle {
  id: string;
  /** Смещение по X в долях ширины контейнера виджета (1 ≈ 1cqw). */
  xCqw: number;
  /** Смещение по Y в долях высоты контейнера виджета (1 ≈ 1cqh). */
  yCqh: number;
  delayMs: number;
  durationMs: number;
  scale: number;
  pulseDurationMs: number;
  pulseDelayMs: number;
  pulseScale: number;
}

const GRID_COLUMNS: number = 18;
const GRID_ROWS: number = 10;
const GRID_SPREAD_X_CQW: number = 48;
const GRID_SPREAD_Y_CQH: number = 46;

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

/** Частицы «взрыва» для оверлея матча; `seed` задаёт стабильные id для React keys. */
export function buildOverlayBurstParticles(seed: number): OverlayParticle[] {
  const particles: OverlayParticle[] = [];
  let index = 0;

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const rowProgress = GRID_ROWS === 1 ? 0.5 : row / (GRID_ROWS - 1);
    const yCqh = (rowProgress - 0.5) * GRID_SPREAD_Y_CQH * 2;

    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const columnProgress = GRID_COLUMNS === 1 ? 0.5 : column / (GRID_COLUMNS - 1);
      const xCqw = (columnProgress - 0.5) * GRID_SPREAD_X_CQW * 2;
      const centerMask = Math.abs(xCqw) < 5 && Math.abs(yCqh) < 3;
      if (centerMask) {
        continue;
      }

      const distance = Math.hypot(xCqw / GRID_SPREAD_X_CQW, yCqh / GRID_SPREAD_Y_CQH);
      const delayMs = 70 + (distance * 460) + randomInRange(0, 55);

      particles.push({
        id: `${seed}-${index}`,
        xCqw,
        yCqh,
        delayMs,
        durationMs: 950 + randomInRange(0, 220),
        scale: 1,
        pulseDurationMs: randomInRange(720, 1400),
        pulseDelayMs: delayMs + randomInRange(460, 900),
        pulseScale: randomInRange(1.16, 1.38),
      });
      index += 1;
    }
  }

  return particles;
}
