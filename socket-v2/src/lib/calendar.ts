/**
 * Calendar helpers for the appointments month grid.
 *
 * Lesson timestamps arrive as "2026-08-03T09:00:00" and, matching the legacy
 * widget, a lesson's *day* is the raw date part of that string, so grouping and
 * calendar keys use `YYYY-MM-DD` strings throughout.
 */

/** "2026-08-03T09:00:00" -> "2026-08-03" */
export const dayKey = (start: string): string => start.substring(0, 10)

/** "2026-08-03" -> "2026-08" */
export const monthKey = (day: string): string => day.substring(0, 7)

/** Today's date as YYYY-MM-DD in the browser's local timezone. */
export function todayKey(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export interface MonthCell {
  /** YYYY-MM-DD, or null for leading/trailing blanks. */
  day: string | null
}

/**
 * Build a Monday-first month grid for "YYYY-MM": leading nulls to align the first
 * day, one cell per day, padded to complete weeks.
 */
export function buildMonthGrid(month: string): MonthCell[] {
  const [y, m] = month.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1, 1))
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  // getUTCDay(): 0=Sun..6=Sat -> Monday-first offset
  const lead = (first.getUTCDay() + 6) % 7
  const cells: MonthCell[] = Array.from({ length: lead }, () => ({ day: null }))
  const pad = (n: number) => String(n).padStart(2, '0')
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: `${y}-${pad(m)}-${pad(d)}` })
  }
  while (cells.length % 7 !== 0) cells.push({ day: null })
  return cells
}

/** "2026-08" +/- n months -> "YYYY-MM" */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Human month title, e.g. "August 2026" (locale-aware). */
export function monthTitle(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, 1)))
}

/** Monday-first weekday initials for the grid header, locale-aware. */
export function weekdayHeaders(): string[] {
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' })
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  )
}
