/** Цвета как у плашек W/L в виджете (`widget-statistics-match-results`). */
const RED = { r: 255, g: 32, b: 82 }
const GREEN = { r: 0, g: 230, b: 118 }
const WHITE = { r: 255, g: 255, b: 255 }

/** Win rate 0–100%: до 30% включительно — красный, от 70% включительно — зелёный, между — белый. */
export function getWinRateThemeRgb(winRatePercent: number): { r: number; g: number; b: number } {
  const p = Math.min(100, Math.max(0, winRatePercent))
  if (p <= 30) {
    return { ...RED }
  }
  if (p >= 70) {
    return { ...GREEN }
  }
  return { ...WHITE }
}

export function rgbToCss({ r, g, b }: { r: number; g: number; b: number }): string {
  return `rgb(${r}, ${g}, ${b})`
}
