import type { Currency, DateFormat, Messages } from '@/config/types'

const intlOptions = Intl.DateTimeFormat().resolvedOptions()
const locale = intlOptions.locale || 'en-US'
export const browserTimezone = intlOptions.timeZone || 'UTC'

const FORMAT_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  full: { day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' },
  month: { month: 'short' },
  /** Month + year: for review dates, where a bare month is ambiguous. */
  month_year: { month: 'short', year: 'numeric' },
  /** Month + day, no time: compact enough for a grid card. */
  month_day: { month: 'short', day: 'numeric' },
  day: { day: 'numeric' },
  weekday: { weekday: 'short' },
  time: { hour: 'numeric', minute: 'numeric' },
}

/** Context object the format helpers are bound to. */
export interface FormatContext {
  messages: Messages
  currency?: Currency
  timezone?: string
}

export function get_text(
  this: FormatContext,
  name: string,
  replacements?: Record<string, unknown>,
): string {
  const s = this.messages[name]
  if (s === undefined) {
    console.warn(`no translation found for "${name}"`)
    return name
  }
  if (typeof s === 'function') {
    return s(replacements ?? {})
  }
  let out = s
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      out = out.replace(`{${k}}`, String(v))
    }
  }
  return out
}

export function format_money(this: FormatContext, amount: number): string {
  const symbol = this.currency ? this.currency.symbol : ''
  return amount % 1 === 0 ? symbol + amount : symbol + amount.toFixed(2)
}

export function format_dt(this: FormatContext, ts: string, fmt: DateFormat): string {
  // Timestamps from the API are always UTC; appending Z lets JS handle the rest.
  const d = new Date(ts + 'Z')
  const options = FORMAT_OPTIONS[fmt]
  if (!options) console.warn('unknown date format:', fmt)
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: this.timezone }).format(d)
}

export function format_duration(this: FormatContext, ts1: string, ts2: string): string {
  const d1 = new Date(ts1)
  const d2 = new Date(ts2)
  let minutes = Math.round((d1.getTime() - d2.getTime()) / 60000)
  const text = get_text.bind(this)
  if (minutes === 60) return text('diff_1hour')
  if (minutes < 60) return text('diff_minutes', { minutes })
  const hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  if (hours === 1) return text('diff_1hour_minutes', { minutes })
  if (minutes === 0) return text('diff_hours', { hours })
  return text('diff_hours_minutes', { hours, minutes })
}
