/**
 * Склеивает CSS-классы в одну строку через пробел.
 * В результат попадают только truthy-значения.
 *
 * @example
 * ```ts
 * classNames('base', isActive && 'active', customClass)
 * ```
 */
export function classNames(...args: (string | undefined | null | false)[]): string {
  return args.filter(value => !!value).join(' ');
}
