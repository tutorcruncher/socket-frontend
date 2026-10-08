import { useMemo, useState } from 'react'
import { useConfig } from '@/config/context'
import type { Appointment, ServiceTutor } from '@/api/types'
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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarPlusIcon,
  LocationIcon,
  StarIcon,
} from '@/components/ui/Icons'
import { DeliveryBadge } from './DeliveryBadge'
import { formatDistance, formatDistanceShort } from '@/lib/delivery'
import { describeTimezone } from '@/lib/formatting'
import { ContractorModal } from '@/components/contractors/ContractorModal'
import { Photo } from '@/components/shared/Photo'

/** How a lesson row is titled: the tutor (linked to their profile) and, when the
 * search covers several subjects, which subject it is. */
export interface SlotDescription {
  subject: string | null
  tutor: ServiceTutor | null
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
  loading = false,
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
  /** The visible month's lessons are still on their way. */
  loading?: boolean
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
          loading={loading}
          slots={daySlots}
          onBook={onBook}
          attendees={attendees}
          describe={describe}
          onTutor={setProfileId}
        />
      </div>

      {/* Parents booking from abroad, or for a child who is, need to know whose
          clock the times are on. */}
      <p className="tw:text-xs tw:text-muted-dark">
        {config.get_text('assuming_timezone', { timezone: describeTimezone(config.timezone) })}
      </p>
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
  // Late in the month the grid is mostly past days, so point at the next one.
  const daysLeft = cells.filter((c) => c.day && c.day >= today).length
  const nearlyOver = month === thisMonth && daysLeft <= 7

  return (
    <div className="tcs-calendar tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:p-4">
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

      <div className="tw:grid tw:grid-cols-7 tw:gap-1 tw:mb-3">
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
                'tcs-day tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-0.5 tw:aspect-square tw:rounded-md tw:text-sm tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
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

      {nearlyOver && (
        <Button
          variant="secondary"
          size="small"
          className="tw:w-full"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          {config.get_text('apt_see_next_month', { month: monthTitle(addMonths(month, 1)) })} →
        </Button>
      )}
    </div>
  )
}

/** Above this many lessons a day, list times first rather than every lesson. */
const BUSY_DAY = 6

/** How many lessons at one time are shown before "Show all". */
const TOP_AT_TIME = 5
/** Hiding only a row or two is not worth a click, so the cap needs this many more. */
const MIN_HIDDEN = 3

type SortKey = 'recommended' | 'nearest' | 'rating' | 'price'
type Compare = (a: Appointment, b: Appointment) => number

// Lessons with no distance (online, or no location searched) sort after those with one.
const FAR = Number.MAX_SAFE_INTEGER
const byDistance: Compare = (a, b) => (a.distance ?? FAR) - (b.distance ?? FAR)
const byPrice: Compare = (a, b) => (a.price ?? 0) - (b.price ?? 0)

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
  loading,
}: {
  day: string | null
  month: string
  loading: boolean
  slots: Appointment[]
  onBook: (apt: Appointment) => void
  attendees: Record<number, number[]> | null
  describe: (apt: Appointment) => SlotDescription
  onTutor: (contractorId: number) => void
}) {
  const config = useConfig()
  const [time, setTime] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('recommended')
  const [showAll, setShowAll] = useState(false)

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

  if (loading) {
    return (
      <div className="tw:flex tw:flex-col tw:gap-2" aria-busy="true">
        <span className="tw:sr-only">{config.get_text('loading')}</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="tw:h-16 tw:rounded-lg tw:bg-hover tw:animate-pulse" />
        ))}
      </div>
    )
  }

  if (!day) {
    return (
      <div className="tw:text-sm tw:text-muted-dark tw:text-center tw:py-8">
        {config.get_text('apt_no_lessons_month', { month: monthTitle(month) })}
      </div>
    )
  }

  const busy = slots.length > BUSY_DAY
  const atTime = busy ? slots.filter((a) => a.start === time) : slots

  // With many tutors free at once, a parent needs the best few first, not a wall of
  // rows: rank them (nearest when a location was searched, then rating, then price)
  // and show the top of the list until asked for the rest.
  const rating = (a: Appointment) => describe(a).tutor?.review_rating ?? 0
  const byRating: Compare = (a, b) => rating(b) - rating(a)
  const hasDistance = atTime.some((a) => typeof a.distance === 'number')
  const hasRating = atTime.some((a) => rating(a) > 0)
  const orders: Record<SortKey, Compare[]> = {
    recommended: hasDistance ? [byDistance, byRating, byPrice] : [byRating, byPrice],
    nearest: [byDistance, byRating, byPrice],
    rating: [byRating, byPrice],
    price: [byPrice, byRating],
  }
  const ranked =
    busy && atTime.length > 1
      ? [...atTime].sort((a, b) => {
          for (const compare of orders[sort]) {
            const diff = compare(a, b)
            if (diff) return diff
          }
          return 0
        })
      : atTime
  const capped = busy && !showAll && ranked.length >= TOP_AT_TIME + MIN_HIDDEN
  const shown = capped ? ranked.slice(0, TOP_AT_TIME) : ranked
  const sortKeys: SortKey[] = [
    'recommended',
    ...(hasDistance ? (['nearest'] as const) : []),
    ...(hasRating ? (['rating'] as const) : []),
    'price',
  ]

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
                    onClick={() => {
                      setTime(active ? null : g.start)
                      setShowAll(false)
                    }}
                    className={cx(
                      'tcs-time tw:inline-flex tw:items-baseline tw:gap-1.5 tw:px-3 tw:py-1.5 tw:rounded-lg tw:border tw:text-sm tw:tabular-nums tw:whitespace-nowrap tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
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

      {busy && atTime.length > 1 && (
        <div className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-x-3 tw:gap-y-1 tw:pt-1">
          <span className="tw:text-sm tw:font-medium">
            {config.get_text('apt_available_at', {
              count: atTime.length,
              time: config.format_dt(atTime[0].start, 'time'),
            })}
          </span>
          {atTime.length > 2 && (
            <label className="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-muted-dark">
              {config.get_text('apt_sort_label')}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="tcs-input tw:px-2 tw:py-1 tw:text-sm tw:text-primary tw:bg-white tw:border tw:border-default tw:rounded-lg"
              >
                {sortKeys.map((key) => (
                  <option key={key} value={key}>
                    {config.get_text(`apt_sort_${key}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
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

      {capped && (
        <Button
          variant="secondary"
          size="small"
          className="tw:self-center"
          onClick={() => setShowAll(true)}
        >
          {config.get_text('apt_show_all', { count: ranked.length })}
        </Button>
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
    <div className="tcs-slot tw:flex tw:flex-wrap tw:@lg:flex-nowrap tw:items-center tw:gap-x-3 tw:gap-y-2 tw:p-3 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm">
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
              {typeof tutor.review_rating === 'number' && (
                <span className="tw:inline-flex tw:items-center tw:gap-0.5 tw:ml-2 tw:text-xs tw:font-normal tw:text-muted-dark tw:align-middle">
                  <StarIcon className="tw:w-3 tw:h-3 tw:text-star" />
                  <span className="tw:font-medium tw:text-heading">
                    {tutor.review_rating.toFixed(1)}
                  </span>
                  {!!tutor.review_count && <span>({tutor.review_count})</span>}
                </span>
              )}
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
          {apt.delivery === 'home_visit' && typeof apt.travel_radius === 'number' && (
            <span className="tw:text-xs tw:text-muted-dark tw:whitespace-nowrap">
              {config.get_text('apt_travels_up_to', {
                distance: formatDistanceShort(config, apt.travel_radius, { whole: true }),
              })}
            </span>
          )}
          {typeof apt.distance === 'number' && (
            <span className="tw:text-xs tw:text-muted-dark tw:whitespace-nowrap">
              {formatDistance(config, apt.distance)}
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
