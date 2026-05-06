import { classNames } from '@/utils/classNames'
import { CountryFlagIcon } from '@components/country-flag-icon/country-flag-icon'
import { RegionFlagIcon } from '@components/region-flag-icon/region-flag-icon'
import './widget-statistics-common-panel-rating.scss'

interface Props {
  /** Тип рейтинга: регион или страна. */
  type: 'region' | 'country';
  /** Код региона или страны. */
  code: string;
  /** Рейтинг игрока в выбранном регионе/стране. */
  rating: number;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент отображения рейтинга игрока в выбранном регионе/стране. */
export function WidgetStatisticsCommonPanelRating(props: Props) {
  const { type, code, rating, className } = props

  return (
    <div className={classNames('widget-statistics-common-panel-rating', className)}>
      {type == 'country'
        ? <CountryFlagIcon countryCode={code} className='widget-statistics-common-panel-rating__icon'/>
        : <RegionFlagIcon regionCode={code} className='widget-statistics-common-panel-rating__icon'/>}
      {`#${rating}`}
    </div>
  )
}
