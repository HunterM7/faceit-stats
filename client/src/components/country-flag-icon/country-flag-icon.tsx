import { classNames } from '@utils/classNames'
import './country-flag-icon.scss'

interface CountryFlagIconProps {
  /** Код страны в формате ISO-3166 alpha-2 (например, `ru`, `us`). */
  countryCode: string
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined
}

export function CountryFlagIcon(props: CountryFlagIconProps) {
  const { countryCode, className } = props

  const normalizedCode = countryCode.trim().toLowerCase()
  if (!normalizedCode) return null

  return <img src={`/flags/${normalizedCode}.svg`} alt={normalizedCode} className={classNames('country-flag-icon', className)}/>
}
