import './widget-statistics-match-results.scss'
import { MatchResult } from './utils/interface';

export { MatchResult };

type WidgetStatisticsMatchResultsProps = {
  /** Значение результата (количество побед или поражений). */
  value: number;
  /** Тип результата для выбора визуального стиля. */
  result: MatchResult;
}

export function WidgetStatisticsMatchResults(props: WidgetStatisticsMatchResultsProps) {
  const { value, result } = props

  return (
    <div className={`widget-statistics-match-results widget-statistics-match-results--${result}`}>
      <div className={`widget-statistics-match-results__value widget-statistics-match-results__value--${result}`}>{value}</div>
      <div className='widget-statistics-match-results__fake-value'>00</div>
    </div>
  )
}
