export function get_text (name, replacements) {
  let s = this.messages[name]
  if (!s) {
    console.warn(`not translation found for "${name}"`)
    return name
  }
  if (replacements) {
    for (let [k, v] of Object.entries(replacements)) {
      s = s.replace(`{${k}}`, v)
    }
  }
  return s
}

export function format_money (amount) {
  const symbol = this.currency ? this.currency.symbol : ''
  if (amount % 1 === 0) {
    return symbol + amount
  } else {
    return symbol + amount.toFixed(2)
  }
}

const intl_options = Intl.DateTimeFormat().resolvedOptions()
const locale = intl_options.locale || 'en-US'
export const timezone = intl_options.timeZone || 'utc'
// const LOCALE = 'en-US'
const FORMAT_OPTIONS = {
  full: {day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric'},
  month: {month: 'short'},
  day: {day: 'numeric'},
  weekday: {weekday: 'short'},
  time: {hour: 'numeric', minute: 'numeric'}
}

export function format_dt (ts, fmt) {
  // timestampts are alwasy in utc thus we need to add the 0000 and js will take care of the rest
  const d = new Date(ts + '+0000')
  let options = FORMAT_OPTIONS[fmt]
  if (!options) {
    console.warn('unknown date format:', fmt)

  }
  return Intl.DateTimeFormat(locale, options).format(d)
}

export function format_duration (ts1, ts2) {
  const d1 = new Date(ts1)
  const d2 = new Date(ts2)
  let minutes = Math.round((d1 - d2) / 60000)
  if (minutes === 60) {
    return this.get_text('diff_1hour')
  }
  if (minutes < 60) {
    return this.get_text('diff_minutes', {minutes})
  }
  const hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  if (hours === 1) {
    return this.get_text('diff_1hour_minutes', {minutes})
  }
  if (minutes === 0) {
    return this.get_text('diff_hours', {hours})
  } else {
    return this.get_text('diff_hours_minutes', {hours, minutes})
  }
}
