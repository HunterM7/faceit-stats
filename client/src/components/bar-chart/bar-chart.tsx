import './bar-chart.scss'

export type BarChartItem = {
  label: string;
  value: number;
  hint?: string;
}

export type BarChartGroup = {
  label?: string;
  title?: string;
  items: BarChartItem[];
}

type BarChartProps = {
  /** Группы данных. */
  groups: BarChartGroup[];
}

/** Верх шкалы и шаг делений — «красивые» кратные 1, 10, 100, 1000 … (например 1247 → max 1300, шаг 100). */
function computeAxisScale(dataMax: number): { axisMax: number; tickStep: number } {
  const max = Math.max(0, dataMax)
  if (max === 0) {
    return { axisMax: 10, tickStep: 1 }
  }

  const magnitude = 10 ** Math.floor(Math.log10(max))
  let tickStep = magnitude / 10
  if (tickStep < 1) {
    tickStep = 1
  }

  let axisMax = Math.ceil(max / tickStep) * tickStep
  let tickCount = Math.floor(axisMax / tickStep) + 1

  while (tickCount > 15) {
    tickStep *= 10
    axisMax = Math.ceil(max / tickStep) * tickStep
    tickCount = Math.floor(axisMax / tickStep) + 1
  }

  while (tickCount < 3 && tickStep > 1) {
    const next = tickStep / 10
    tickStep = next >= 1 ? next : 1
    axisMax = Math.ceil(max / tickStep) * tickStep
    tickCount = Math.floor(axisMax / tickStep) + 1
  }

  return { axisMax, tickStep }
}

function buildAxisTicks(axisMax: number, tickStep: number): number[] {
  const ticks: number[] = []
  for (let v = 0; v <= axisMax; v += tickStep) {
    ticks.push(v)
  }
  return ticks
}

/** Высота столбца в % от области баров: 0 → 5%, максимум по шкале → 100%. */
function barHeightPercent(value: number, axisMax: number): number {
  if (axisMax <= 0) {
    return 5
  }
  const t = Math.min(1, Math.max(0, value / axisMax))
  return Math.round(5 + t * 95)
}

/** График со столбцами. */
export function BarChart(props: BarChartProps) {
  const { groups } = props
  const items = groups.flatMap((group) => group.items)
  if (items.length === 0) {
    return (
      <div className='bar-chart'>
        <p className='bar-chart__empty'>Пока нет данных за выбранный период.</p>
      </div>
    )
  }

  const dataMax = Math.max(0, ...items.map((item) => item.value))
  const { axisMax, tickStep } = computeAxisScale(dataMax === 0 ? 1 : dataMax)
  const axisTicks = buildAxisTicks(axisMax, tickStep)

  const groupsEnabled = groups.length > 1
  const spans = getGroupSpans(groups)
  const splitIndices = groupsEnabled ? new Set(spans.slice(1).map((span) => span.startIndex)) : new Set<number>()

  const gridTemplateColumns = `repeat(${items.length}, minmax(18px, 1fr))`

  return (
    <div className='bar-chart'>
      <div className='bar-chart__plot'>
        <div className='bar-chart__y-axis' aria-hidden>
          {axisTicks.map((tick) => {
            if (tick === axisMax) {
              return (
                <span
                  key={tick}
                  className='bar-chart__y-tick bar-chart__y-tick--max'
                >
                  {tick.toLocaleString('ru-RU')}
                </span>
              )
            }
            const fromBottomPct = (tick / axisMax) * 100
            let transform = 'translateY(-50%)'
            if (tick === 0) {
              transform = 'translateY(0)'
            }
            return (
              <span
                key={tick}
                className='bar-chart__y-tick'
                style={{
                  bottom: `${fromBottomPct}%`,
                  transform,
                }}
              >
                {tick.toLocaleString('ru-RU')}
              </span>
            )
          })}
        </div>
        <div className='bar-chart__chart-column'>
          <div className='bar-chart__grid bar-chart__grid--bars' style={{ gridTemplateColumns }}>
            {items.map((item, index) => {
              const height = barHeightPercent(item.value, axisMax)
              const hasGroupSplit = splitIndices.has(index)
              return (
                <div
                  key={`${item.label}-${item.value}-${index}`}
                  className='bar-chart__bar-col'
                >
                  <div className={`bar-chart__bar-wrap ${hasGroupSplit ? 'bar-chart__bar-wrap--split' : ''}`}>
                    <div
                      className='bar-chart__bar'
                      style={{ height: `${height}%` }}
                      title={String(item.value)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className='bar-chart__grid bar-chart__grid--labels' style={{ gridTemplateColumns }}>
            {items.map((item, index) => (
              <div
                key={`${item.label}-axis-${index}`}
                className='bar-chart__bar-label'
                title={item.hint}
              >
                {item.label}
              </div>
            ))}
          </div>
          {groupsEnabled ? (
            <div className='bar-chart__groups' style={{ gridTemplateColumns }}>
              {spans.map((span, index) => (
                <div
                  key={`${span.group.label ?? ''}-${span.startIndex}-${span.endIndex}-${index}`}
                  className='bar-chart__group'
                  style={{ gridColumn: `${span.startIndex + 1} / ${span.endIndex + 2}` }}
                  title={span.group.title}
                >
                  {span.group.label ?? ''}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function getGroupSpans(groups: BarChartGroup[]): Array<{ group: BarChartGroup; startIndex: number; endIndex: number }> {
  const spans: Array<{ group: BarChartGroup; startIndex: number; endIndex: number }> = []
  let cursor = 0
  for (const group of groups) {
    const groupLength = group.items.length
    if (groupLength === 0) {
      continue
    }
    spans.push({
      group,
      startIndex: cursor,
      endIndex: cursor + groupLength - 1,
    })
    cursor += groupLength
  }
  return spans
}
