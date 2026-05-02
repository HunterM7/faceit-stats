import { classNames } from '@/utils/classNames'
import './region-flag-icon.scss'

type RegionFlagIconProps = {
  /** Код региона FACEIT (например `EU`, `na`, `OCE`). */
  regionCode: string;
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined;
}

/** Компонент отображения иконки региона. */
export function RegionFlagIcon(props: RegionFlagIconProps) {
  const { regionCode, className } = props

  const normalizedCode = regionCode.trim().toLowerCase()

  return <img src={`/regions/${normalizedCode}.svg`} alt={normalizedCode} className={classNames('region-flag-icon', className)}/>
}
