const longFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
})

/**
 * Formats a `YYYY-MM-DD` civil date as "01 de setembro de 2024". Parsing in UTC
 * keeps the day stable regardless of the visitor timezone.
 */
export function formatLongDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return value

  return longFormatter.format(new Date(Date.UTC(year, month - 1, day)))
}
