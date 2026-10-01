import { Fragment } from 'react'
import { useConfig } from '@/config/context'
import { CheckIcon } from '@/components/ui/Icons'
import { cx } from '@/lib/utils'

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export const PERIODS = ['morning', 'afternoon', 'evening'] as const
export type Day = (typeof DAYS)[number]
export type Period = (typeof PERIODS)[number]

/** One ticked cell of the weekly grid, as sent to the API. */
export interface PreferredTime {
  day: Day
  period: Period
}

export const timeKey = (day: Day, period: Period) => `${day}-${period}`

/** Localised weekday name. 1 January 2024 was a Monday, so index 0 is Monday. */
export function dayName(index: number, width: 'long' | 'short'): string {
  return new Intl.DateTimeFormat(undefined, { weekday: width, timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, 0, 1 + index)),
  )
}

export function toPreferredTimes(selected: Set<string>): PreferredTime[] {
  return DAYS.flatMap((day) =>
    PERIODS.filter((period) => selected.has(timeKey(day, period))).map((period) => ({ day, period })),
  )
}

/**
 * Weekly availability: days down the side, morning / afternoon / evening across,
 * each cell a toggle. Days are rows so the grid fits a phone. A day's name or a
 * column heading toggles the whole row or column. Nothing ticked means any time.
 * The periods match how the booking calendar groups a busy day's times.
 */
export function AvailabilityGrid({
  value,
  onChange,
}: {
  value: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const config = useConfig()

  // All on already: clear them. Otherwise turn the rest on.
  const toggle = (keys: string[]) => {
    const next = new Set(value)
    const allOn = keys.every((k) => next.has(k))
    for (const k of keys) {
      if (allOn) next.delete(k)
      else next.add(k)
    }
    onChange(next)
  }

  const header =
    'tw:rounded tw:cursor-pointer tw:hover:bg-hover tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link'

  return (
    <div
      role="group"
      aria-label={config.get_text('req_times_label')}
      className="tw:grid tw:grid-cols-[auto_repeat(3,minmax(0,1fr))] tw:gap-2 tw:items-center"
    >
      <span />
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => toggle(DAYS.map((day) => timeKey(day, period)))}
          className={cx(header, 'tw:flex tw:flex-col tw:items-center tw:py-1 tw:text-xs')}
        >
          <span className="tw:font-medium">{config.get_text(`apt_${period}`)}</span>
          <span className="tw:text-muted-dark">{config.get_text(`req_${period}_hours`)}</span>
        </button>
      ))}

      {DAYS.map((day, i) => (
        <Fragment key={day}>
          <button
            type="button"
            onClick={() => toggle(PERIODS.map((period) => timeKey(day, period)))}
            className={cx(header, 'tw:text-sm tw:font-medium tw:text-left tw:px-1 tw:py-2')}
          >
            <span className="tw:sm:hidden">{dayName(i, 'short')}</span>
            <span className="tw:hidden tw:sm:inline">{dayName(i, 'long')}</span>
          </button>
          {PERIODS.map((period) => {
            const on = value.has(timeKey(day, period))
            return (
              <button
                key={period}
                type="button"
                aria-pressed={on}
                aria-label={`${dayName(i, 'long')} ${config.get_text(`apt_${period}`).toLowerCase()}`}
                onClick={() => toggle([timeKey(day, period)])}
                className={cx(
                  'tcs-time tw:flex tw:items-center tw:justify-center tw:h-10 tw:rounded-lg tw:border tw:transition-colors tw:cursor-pointer tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
                  on
                    ? 'tw:border-primary tw:bg-primary tw:text-white'
                    : 'tw:border-default tw:bg-white tw:hover:bg-hover',
                )}
              >
                {on && <CheckIcon className="tw:w-3.5 tw:h-3.5" />}
              </button>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
