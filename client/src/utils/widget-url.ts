export type BoolSetting = 'true' | 'false'

type QueryValue = string | number | boolean | null | undefined

export function buildUrl(pathname: string, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([ key, value ]) => {
    if (value === null || value === undefined || value === '') return
    params.set(key, String(value))
  })

  const queryString = params.toString()
  return queryString ? `${window.location.origin}${pathname}?${queryString}` : `${window.location.origin}${pathname}`
}
