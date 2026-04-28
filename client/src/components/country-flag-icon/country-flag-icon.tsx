import { classNames } from '@utils/classNames'
import './country-flag-icon.scss'

const FLAG_ICONS = import.meta.glob('../../images/flags/*.svg', { eager: true, import: 'default' }) as Record<string, string>

interface CountryFlagIconProps {
  /** Код страны в формате ISO-3166 alpha-2 (например, `ru`, `us`). */
  countryCode: string
  /** Дополнительный класс для стилизации компонента. */
  className?: string | undefined
}

export function CountryFlagIcon(props: CountryFlagIconProps) {
  const { countryCode, className } = props

  const normalizedCode = countryCode.trim().toLowerCase()
  const countryFlagSrc = FLAG_ICONS[`../../images/flags/${normalizedCode}.svg`]

  if (!countryFlagSrc) return null

  return <img src={countryFlagSrc} alt={normalizedCode} className={classNames('country-flag-icon', className)}/>
}
