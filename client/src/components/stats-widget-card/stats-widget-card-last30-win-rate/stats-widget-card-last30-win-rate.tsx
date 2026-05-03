import type { CSSProperties } from 'react'
import { useId, useMemo } from 'react'
import { classNames } from '@/utils/classNames'
import { getWinRateThemeRgb, rgbToCss } from './win-rate-palette'
import './stats-widget-card-last30-win-rate.scss'

type StatsWidgetCardLast30WinRateProps = {
  /** Процент побед 0–100 (как с сервера). */
  winRatePercent: number;
  /** Последовательность матчей: `true` — победа, `false` — поражение (слева старые). */
  matchResults: boolean[];
  /** Дополнительный класс. */
  className?: string | undefined;
}

const VIEW_W = 100
const VIEW_H = 100
const PAD_Y = 8
const BASELINE_Y = VIEW_H - PAD_Y

/** После каждого матча: победа +1 (линия вверх), поражение −1. */
function buildCumulative(matchResults: boolean[]): number[] {
  let acc = 0
  return matchResults.map((win) => {
    acc += win ? 1 : -1
    return acc
  })
}

function normalizeYs(series: number[]): number[] {
  if (series.length === 0) {
    return []
  }
  const vals = series
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  let span = maxV - minV
  if (span === 0) {
    span = 1
  }
  const pad = span * 0.12
  const lo = minV - pad
  const hi = maxV + pad
  const range = hi - lo || 1
  return vals.map((v) => {
    const t = (v - lo) / range
    return PAD_Y + (1 - t) * (VIEW_H - 2 * PAD_Y)
  })
}

type ChartPoint = { x: number; y: number }

/** Uniform Catmull–Rom → кубические Безье (`C`), концы через дубли соседних точек. */
const CATMULL_TO_CUBIC = 6

function smoothBezierChain(points: ChartPoint[]): string {
  const n = points.length
  if (n < 2) {
    return ''
  }
  let d = ''
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(n - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / CATMULL_TO_CUBIC
    const cp1y = p1.y + (p2.y - p0.y) / CATMULL_TO_CUBIC
    const cp2x = p2.x - (p3.x - p1.x) / CATMULL_TO_CUBIC
    const cp2y = p2.y - (p3.y - p1.y) / CATMULL_TO_CUBIC
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
  }
  return d
}

function smoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return ''
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }
  if (points.length === 2) {
    const [ a, b ] = points
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  }
  return `M ${points[0].x} ${points[0].y}${smoothBezierChain(points)}`
}

type Last30WinRateChartSvgProps = {
  gradId: string;
  accent: string;
  linePath: string;
  areaPath: string;
}

/** Отдельный компонент — иначе `react/jsx-max-depth` (defs → gradient → stop). */
function Last30WinRateChartSvg(props: Last30WinRateChartSvgProps) {
  const { gradId, accent, linePath, areaPath } = props
  return (
    <svg
      className='stats-widget-card-last30-win-rate__svg'
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio='none'
    >
      <defs>
        <linearGradient id={gradId} gradientUnits='userSpaceOnUse' x1='0' y1={PAD_Y} x2='0' y2={BASELINE_Y}>
          <stop offset='0%' stopColor={accent} stopOpacity={0.38}/>
          <stop offset='38%' stopColor={accent} stopOpacity={0.17}/>
          <stop offset='100%' stopColor={accent} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <path className='stats-widget-card-last30-win-rate__area' d={areaPath} fill={`url(#${gradId})`}/>
      <path className='stats-widget-card-last30-win-rate__line' d={linePath} fill='none'/>
    </svg>
  )
}

export function StatsWidgetCardLast30WinRate(props: StatsWidgetCardLast30WinRateProps) {
  const { winRatePercent, matchResults, className } = props
  const uid = useId()
  const gradId = `${uid.replace(/:/g, '')}-wr-fill`

  const theme = useMemo(() => getWinRateThemeRgb(winRatePercent), [ winRatePercent ])
  const accent = rgbToCss(theme)

  const style = { '--wr-accent': accent } as CSSProperties

  const { linePath, areaPath } = useMemo(() => {
    const n = matchResults.length
    if (n === 0) {
      const y = (VIEW_H - 2 * PAD_Y) / 2 + PAD_Y
      return {
        linePath: `M 0 ${y} L ${VIEW_W} ${y}`,
        areaPath: `M 0 ${BASELINE_Y} L 0 ${y} L ${VIEW_W} ${y} L ${VIEW_W} ${BASELINE_Y} Z`,
      }
    }

    const cumulative = buildCumulative(matchResults)
    const ys = normalizeYs(cumulative)
    const xs = cumulative.map((_, i) => (n === 1 ? VIEW_W / 2 : (i / (n - 1)) * VIEW_W))
    const poly = xs.map((x, i) => ({ x, y: ys[i] }))

    const line =
      n === 1
        ? `M ${VIEW_W * 0.2} ${ys[0]} L ${VIEW_W * 0.8} ${ys[0]}`
        : smoothLinePath(poly)

    const xFirst = n === 1 ? VIEW_W * 0.2 : xs[0]
    const xLast = n === 1 ? VIEW_W * 0.8 : xs[xs.length - 1]
    const yFirst = ys[0]

    const area =
      n === 1
        ? `M ${xFirst} ${BASELINE_Y} L ${xFirst} ${yFirst} L ${xLast} ${yFirst} L ${xLast} ${BASELINE_Y} Z`
        : `M ${xFirst} ${BASELINE_Y} L ${xFirst} ${yFirst}${smoothBezierChain(poly)} L ${xLast} ${BASELINE_Y} Z`

    return { linePath: line, areaPath: area }
  }, [ matchResults ])

  const displayPercent = Math.min(100, Math.max(0, Math.round(winRatePercent)))

  return (
    <div
      className={classNames('stats-widget-card-last30-win-rate', className)}
      style={style}
      role='img'
      aria-label={`Win rate за последние матчи: ${displayPercent} процентов`}
    >
      <div className='stats-widget-card-last30-win-rate__chart'>
        <div className='stats-widget-card-last30-win-rate__plate' aria-hidden>
          <Last30WinRateChartSvg gradId={gradId} accent={accent} linePath={linePath} areaPath={areaPath}/>
        </div>
        <div className='stats-widget-card-last30-win-rate__front' aria-hidden>
          <span className='stats-widget-card-last30-win-rate__value'>{`${displayPercent}%`}</span>
        </div>
      </div>
      <div className='stats-widget-card-last30-win-rate__label'>Win rate</div>
    </div>
  )
}
