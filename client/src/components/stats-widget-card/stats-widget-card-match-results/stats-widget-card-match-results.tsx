import './stats-widget-card-match-results.scss'
import { MatchResult } from './utils/interface';

export { MatchResult };

type StatsWidgetCardMatchResultsProps = {
  /** Значение результата (количество побед или поражений). */
  value: number;
  /** Тип результата для выбора визуального стиля. */
  result: MatchResult;
}

export function StatsWidgetCardMatchResults(props: StatsWidgetCardMatchResultsProps) {
  const { value, result } = props

  return (
    <div className={`stats-widget-card-match-results stats-widget-card-match-results--${result}`}>
      <div className={`stats-widget-card-match-results__value stats-widget-card-match-results__value--${result}`}>{value}</div>
    </div>
  )
}
