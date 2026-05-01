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

  const maxBarValue = Math.max(1, ...items.map((item) => item.value))
  const groupsEnabled = groups.length > 1
  const spans = getGroupSpans(groups)
  const splitIndices = groupsEnabled ? new Set(spans.slice(1).map((span) => span.startIndex)) : new Set<number>()

  const gridTemplateColumns = `repeat(${items.length}, minmax(18px, 1fr))`

  return (
    <div className='bar-chart'>
      <div className='bar-chart__grid' style={{ gridTemplateColumns }}>
        {items.map((item, index) => {
          const height = Math.max(8, Math.round((item.value / maxBarValue) * 100))
          const hasGroupSplit = splitIndices.has(index)
          return (
            <div
              key={`${item.label}-${item.value}-${index}`}
              className='bar-chart__bar-col'
            >
              <div className='bar-chart__bar-value'>{item.value}</div>
              <div className={`bar-chart__bar-wrap ${hasGroupSplit ? 'bar-chart__bar-wrap--split' : ''}`}>
                <div className='bar-chart__bar' style={{ height: `${height}%` }}/>
              </div>
              <div className='bar-chart__bar-label' title={item.hint}>{item.label}</div>
            </div>
          )
        })}
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
