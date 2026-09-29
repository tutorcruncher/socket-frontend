import { useMemo, useState } from 'react'
import { useConfig } from '@/config/context'
import type { Appointment } from '@/api/types'
import { cx } from '@/lib/utils'
import {
  addMonths,
  buildMonthGrid,
  dayKey,
  monthKey,
  monthTitle,
  todayKey,
  weekdayHeaders,
} from '@/lib/calendar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChevronLeftIcon, ChevronRightIcon, CalendarPlusIcon, LocationIcon } from '@/components/ui/Icons'
import { DeliveryBadge } from './DeliveryBadge'
import { formatDistance } from '@/lib/delivery'
import { ContractorModal } from '@/components/contractors/ContractorModal'
import { Photo } from '@/components/shared/Photo'

/** How a lesson row is titled: the tutor (linked to their profile) and, when the
 * search covers several subjects, which subject it is. */
export interface SlotDescription {
  subject: string | null
  tutor: { id: number; name: string; photo?: string | null } | null
}

/** Spaces left on a lesson, or null when unlimited. */
const spacesLeft = (a: Appointment) =>
  a.attendees_max === null ? null : a.attendees_max - a.attendees_count

export const isBookable = (a: Appointment) => spacesLeft(a) !== 0

/**
 * Step 2: month calendar of available dates for the chosen lesson type, with a
 * "next available" shortcut and the selected day's bookable slots beneath.
 * `appointments` is the visible month only; `nextAvailable` is the next bookable
 * lesson from today in any month.
 */
export function CalendarStep({
  appointments,
  nextAvailable,
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
  onBook,
  attendees,
  describe,
}: {
  appointments: Appointment[]
  nextAvailable: Appointment | null
  month: string
  onMonthChange: (month: string) => void
  selectedDay: string | null
  onSelectDay: (day: string) => void
  onBook: (apt: Appointment) => void
  attendees: Record<number, number[]> | null
  describe: (apt: Appointment) => SlotDescription
}) {
  const config = useConfig()
  const today = todayKey()
  const [profileId, setProfileId] = useState<number | null>(null)

  // day -> bookable lessons from today on. Full lessons are left out entirely:
  // a parent can't book them, so they only add noise.
  const byDay = useMemo(() => {
    const m = new Map<string, Appointment[]>()
    for (const a of appointments) {
      const d = dayKey(a.start)
      if (d < today || !isBookable(a)) continue
      const list = m.get(d)
      if (list) list.push(a)
      else m.set(d, [a])
    }
    return m
  }, [appointments, today])


  // Nothing bookable in any month. An empty month alone still shows the calendar.
  if (!nextAvailable) {
    return (
      <EmptyState
        title={config.get_text('apt_no_lessons_found')}
        description={config.get_text('apt_no_lessons_found_desc')}
        icon={<CalendarPlusIcon className="tw:w-10 tw:h-10" />}
      />
    )
  }

  const daySlots = selectedDay ? (byDay.get(selectedDay) ?? []) : []

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {/* A quiet shortcut, only offered once the visitor has moved away from it. */}
      {nextAvailable && dayKey(nextAvailable.start) !== selectedDay && (
        <button
          type="button"
          onClick={() => {
            const d = dayKey(nextAvailable.start)
            onMonthChange(monthKey(d))
            onSelectDay(d)
          }}
          className="tw:self-start tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:cursor-pointer tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          {config.get_text('apt_next_available')}: {config.format_dt(nextAvailable.start, 'full')} →
        </button>
      )}

      <div className="tw:grid tw:md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] tw:gap-4 tw:items-start">
        <MonthGrid
          month={month}
          onMonthChange={onMonthChange}
          byDay={byDay}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
        />
        <DaySlots
          // Keyed so a chosen time resets when the day changes.
          key={selectedDay ?? ''}
          day={selectedDay}
          month={month}
          slots={daySlots}
          onBook={onBook}
          attendees={attendees}
          describe={describe}
          onTutor={setProfileId}
        />
      </div>
      {profileId !== null && (
        <ContractorModal id={profileId} onClose={() => setProfileId(null)} profileOnly />
      )}
    </div>
  )
}

function MonthGrid({
  month,
  onMonthChange,
  byDay,
  today,
  selectedDay,
  onSelectDay,
}: {
  month: string
  onMonthChange: (m: string) => void
  byDay: Map<string, Appointment[]>
  today: string
  selectedDay: string | null
  onSelectDay: (day: string) => void
}) {
  const config = useConfig()
  const cells = buildMonthGrid(month)
  const headers = weekdayHeaders()
  const thisMonth = monthKey(today)

  return (
    <div className="tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:p-4">
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
        <button
          type="button"
          aria-label="Previous month"
          disabled={month <= thisMonth}
          onClick={() => onMonthChange(addMonths(month, -1))}
          className="tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded-md tw:text-muted-dark tw:hover:bg-hover tw:disabled:opacity-30 tw:disabled:cursor-not-allowed tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          <ChevronLeftIcon className="tw:w-3.5 tw:h-3.5" />
        </button>
        <div className="tw:text-base tw:font-medium tw:font-heading">{monthTitle(month)}</div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded-md tw:text-muted-dark tw:hover:bg-hover tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          <ChevronRightIcon className="tw:w-3.5 tw:h-3.5" />
        </button>
      </div>

      <div className="tw:grid tw:grid-cols-7 tw:gap-1 tw:text-center tw:text-xs tw:text-muted-dark tw:mb-1">
        {headers.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      <div className="tw:grid tw:grid-cols-7 tw:gap-1">
        {cells.map((cell, i) => {
          if (!cell.day) return <div key={i} />
          const slots = byDay.get(cell.day)
          const isPast = cell.day < today
          const available = !!slots && !isPast
          const selected = cell.day === selectedDay
          const dayNum = Number(cell.day.substring(8, 10))
          // Dots show how busy a day is (1 to 3), so a parent can spot the days
          // with the most choice. Service colours stopped meaning anything once
          // a subject spans several tutors.
          const open = available ? slots.length : 0
          const dots = open === 0 ? 0 : open >= 10 ? 3 : open >= 4 ? 2 : 1
          return (
            <button
              key={cell.day}
              type="button"
              disabled={!available}
              onClick={() => onSelectDay(cell.day!)}
              aria-pressed={selected}
              aria-label={
                available ? `${dayNum}, ${config.get_text('apt_day_lessons', { count: open })}` : undefined
              }
              className={cx(
                'tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-0.5 tw:aspect-square tw:rounded-md tw:text-sm tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
                selected
                  ? 'tw:bg-primary tw:text-white tw:font-semibold'
                  : available
                    ? 'tw:cursor-pointer tw:hover:bg-hover tw:font-medium'
                    : 'tw:text-muted tw:cursor-default',
                cell.day === today && !selected && 'tw:border tw:border-link',
              )}
            >
              <span>{dayNum}</span>
              <span className="tw:flex tw:gap-0.5 tw:h-1.5">
                {Array.from({ length: dots }, (_, j) => (
                  <span
                    key={j}
                    className={cx('tw:w-1.5 tw:h-1.5 tw:rounded-full', selected ? 'tw:bg-white' : 'tw:bg-link')}
                  />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Above this many lessons a day, list times first rather than every lesson. */
const BUSY_DAY = 6

type Period = 'morning' | 'afternoon' | 'evening'
const PERIODS: Period[] = ['morning', 'afternoon', 'evening']

function DaySlots({
  day,
  slots,
  onBook,
  attendees,
  describe,
  onTutor,
  month,
}: {
  day: string | null
  month: string
  slots: Appointment[]
  onBook: (apt: Appointment) => void
  attendees: Record<number, number[]> | null
  describe: (apt: Appointment) => SlotDescription
  onTutor: (contractorId: number) => void
}) {
  const config = useConfig()
  const [time, setTime] = useState<string | null>(null)

  // Lessons sharing a start time, grouped into parts of the day. Hours come from
  // the tenant timezone so the grouping matches the times shown.
  const byPeriod = useMemo(() => {
    const hourFmt = new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: config.timezone || undefined,
    })
    const groups: Record<Period, Array<{ start: string; slots: Appointment[] }>> = {
      morning: [],
      afternoon: [],
      evening: [],
    }
    const seen = new Map<string, Appointment[]>()
    for (const a of slots) {
      const list = seen.get(a.start)
      if (list) {
        list.push(a)
        continue
      }
      const group = [a]
      seen.set(a.start, group)
      const hour = Number(hourFmt.format(new Date(`${a.start}Z`)))
      const period: Period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
      groups[period].push({ start: a.start, slots: group })
    }
    return groups
  }, [slots, config.timezone])

  if (!day) {
    return (
      <div className="tw:text-sm tw:text-muted-dark tw:text-center tw:py-8">
        {config.get_text('apt_no_lessons_month', { month: monthTitle(month) })}
      </div>
    )
  }

  const busy = slots.length > BUSY_DAY
  const shown = busy ? slots.filter((a) => a.start === time) : slots

  return (
    <div className="tw:flex tw:flex-col tw:gap-3 tw:min-w-0">
      <h3 className="tw:text-sm tw:font-semibold tw:font-heading tw:text-muted-dark tw:uppercase tw:tracking-wider">
        {config.get_text('apt_slots_title', {
          date: new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
          }).format(new Date(day)),
        })}
      </h3>
      {slots.length === 0 && (
        <div className="tw:text-sm tw:text-muted-dark">{config.get_text('apt_no_lessons_day')}</div>
      )}

      {busy &&
        PERIODS.filter((p) => byPeriod[p].length > 0).map((p) => (
          <div key={p} className="tw:flex tw:flex-col tw:gap-1.5">
            <div className="tw:text-xs tw:font-medium tw:text-muted-dark">
              {config.get_text(`apt_${p}`)}
            </div>
            <div className="tw:flex tw:flex-wrap tw:gap-2">
              {byPeriod[p].map((g) => {
                const open = g.slots.length
                const active = g.start === time
                return (
                  <button
                    key={g.start}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTime(active ? null : g.start)}
                    className={cx(
                      'tw:inline-flex tw:items-baseline tw:gap-1.5 tw:px-3 tw:py-1.5 tw:rounded-lg tw:border tw:text-sm tw:tabular-nums tw:whitespace-nowrap tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
                      active
                        ? 'tw:border-primary tw:bg-primary tw:text-white tw:cursor-pointer'
                        : 'tw:border-default tw:bg-white tw:hover:bg-hover tw:cursor-pointer',
                    )}
                  >
                    <span className="tw:font-medium">{config.format_dt(g.start, 'time')}</span>
                    {/* How many tutors have space at this time. */}
                    {open > 1 && (
                      <span
                        className={cx('tw:text-xs', active ? 'tw:text-white/80' : 'tw:text-muted-dark')}
                        aria-label={config.get_text('apt_lessons_at_time', { count: open })}
                      >
                        ×{open}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

      {busy && time === null && (
        <p className="tw:text-sm tw:text-muted-dark">{config.get_text('apt_pick_time')}</p>
      )}

      {shown.length > 0 && (
        // A container, so rows lay out by the column's width rather than the screen's:
        // the column is narrow on tablets as well as phones.
        <div className={cx('tw:@container tw:flex tw:flex-col tw:gap-2', busy && 'tw:pt-1')}>
          {shown.map((apt) => (
            <SlotRow
              key={apt.id}
              apt={apt}
              onBook={onBook}
              attendees={attendees}
              {...describe(apt)}
              onTutor={onTutor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SlotRow({
  apt,
  onBook,
  attendees,
  subject,
  tutor,
  onTutor,
}: SlotDescription & {
  apt: Appointment
  onBook: (apt: Appointment) => void
  attendees: Record<number, number[]> | null
  onTutor: (contractorId: number) => void
}) {
  const config = useConfig()
  const spaces = spacesLeft(apt)
  const attending = !!attendees && attendees[apt.id] !== undefined
  const full = spaces === 0
  // Shown in one of two places by row width; the wrapper carries the visibility
  // because the badge's own `inline-flex` would override a `hidden` on it.
  const spacesBadge = (className: string) => (
    <span className={className}>
      <Badge variant={full ? 'danger' : attending ? 'info' : 'success'}>
        {config.get_text(attending ? 'spaces_attending' : 'spaces', { spaces })}
      </Badge>
    </span>
  )

  return (
    // Narrow: price and Book wrap onto their own line under the lesson details.
    <div className="tw:flex tw:flex-wrap tw:@lg:flex-nowrap tw:items-center tw:gap-x-3 tw:gap-y-2 tw:p-3 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm">
      <div className="tw:shrink-0 tw:text-center tw:w-18">
        <div className="tw:font-semibold tw:tabular-nums tw:whitespace-nowrap">{config.format_dt(apt.start, 'time')}</div>
        <div className="tw:text-xs tw:text-muted-dark">
          {config.format_duration(apt.finish, apt.start)}
        </div>
      </div>
      {tutor && (
        // Same action as the name link, so kept out of the tab order to avoid a
        // second stop for keyboard and screen reader users.
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onTutor(tutor.id)}
          className="tw:shrink-0 tw:cursor-pointer tw:rounded-full"
        >
          <Photo
            src={tutor.photo ?? ''}
            alt={tutor.name}
            className="tw:w-10 tw:h-10 tw:rounded-full tw:overflow-hidden tw:text-sm"
          />
        </button>
      )}
      <div className="tw:flex-1 tw:min-w-0">
        <div className="tw:text-sm tw:font-medium tw:truncate">
          {tutor ? (
            <>
              {subject && `${subject} with `}
              {/* Parents meet the tutor here, so the name opens their profile. */}
              <button
                type="button"
                onClick={() => onTutor(tutor.id)}
                className="tw:font-medium tw:text-link tw:hover:underline tw:cursor-pointer tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
              >
                {tutor.name}
              </button>
            </>
          ) : (
            apt.service_name
          )}
        </div>
        <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-1.5 tw:mt-1">
          {apt.delivery && <DeliveryBadge mode={apt.delivery} />}
          {spacesBadge('tw:hidden tw:@lg:flex tw:shrink-0')}
        </div>
        <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-2 tw:mt-1">
          {apt.delivery === 'in_person' && (apt.address?.pretty || apt.location) && (
            <span className="tw:inline-flex tw:items-center tw:gap-1 tw:text-xs tw:text-muted-dark tw:min-w-0">
              <LocationIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
              <span className="tw:truncate">{apt.address?.pretty ?? apt.location}</span>
            </span>
          )}
          {typeof apt.distance === 'number' && (
            <span className="tw:text-xs tw:text-muted-dark">
              · {formatDistance(config, apt.distance)}
            </span>
          )}
        </div>
      </div>
      <div className="tw:flex tw:items-center tw:gap-3 tw:shrink-0 tw:basis-full tw:@lg:basis-auto tw:pt-2 tw:border-t tw:border-default tw:@lg:pt-0 tw:@lg:border-t-0">
        {/* Narrow rows have no room for this beside the details; it leads the price line. */}
        {spacesBadge('tw:flex tw:@lg:hidden tw:mr-auto')}
        {apt.price !== null && (
          <span className="tw:font-semibold">{config.format_money(apt.price)}</span>
        )}
        <Button size="small" disabled={full} onClick={() => onBook(apt)}>
          {config.get_text('apt_book_slot')}
        </Button>
      </div>
    </div>
  )
}
