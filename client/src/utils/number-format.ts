/**
 * Форматирует число с фиксированным количеством знаков после запятой.
 */
export function formatNumberWithFixedDecimals(value: number, fractionDigits: number): string {
  return value.toFixed(fractionDigits)
}
