import { useMemo, useState } from 'react'
import { deliveryLabelKey, formatDistanceShort } from '@/lib/delivery'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import { useAppointmentsMonth, useAppointmentsWindow, useServices } from '@/api/queries'
import { useAppointmentAuth } from '@/lib/useAppointmentAuth'
import { dayKey, monthKey, todayKey } from '@/lib/calendar'
import type { Appointment } from '@/api/types'
import { CenteredSpinner } from '@/components/ui/Spinner'
import { CalendarSkeleton } from './CalendarSkeleton'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { AccountLine } from './AccountLine'
import { SearchForm, type AppointmentSearch } from './SearchForm'
import { CalendarStep, isBookable } from './CalendarStep'
import { BookingPanel } from './BookingPanel'
import { FlowLayout } from '@/components/shared/FlowLayout'
import { useBookingSteps } from './steps'
import { MyBookings } from './MyBookings'
import { getMockBookings } from '@/api/mock'
import { serviceIdsFor, subjectOf } from '@/lib/services'

/**
 * Appointments: search-first booking flow:
 *   1. SearchForm:   pick lesson type (+ venue)
 *   2. CalendarStep: month grid of available dates + day slot list
 *   3. BookingPanel: inline booking, as a guest or a signed-in client
 *
 * Nothing stands between a visitor and the lessons: signing in is offered
 * (`AccountLine`) but never required, and a new client's account is created at
 * booking. Only the booking step is routed (`#/appointment/:id`) so old deep links
 * keep working; search/calendar state lives in the component.
 */
export function Appointments() {
  const config = useConfig()
  const url = useUrl()
  const navigate = useNavigate()
  const loc = useLocation()
  const auth = useAppointmentAuth()
  // Show the bookings tab once the visitor has something to manage.
  const hasBookings = getMockBookings().length > 0

  const [view, setView] = useState<'book' | 'bookings'>('book')
  const [search, setSearch] = useState<AppointmentSearch | null>(null)
  // "Change" reopens the search form pre-filled rather than discarding the search.
  const [editingSearch, setEditingSearch] = useState(false)
  // Both null until the visitor navigates; derived defaults are used meanwhile.
  const [month, setMonth] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const bookingSteps = useBookingSteps()
  const { data: services = [] } = useServices()
  const NO_FILTERS = { serviceIds: null, delivery: null, location: null, radius: null }
  // Unfiltered window backs deep links (a booked slot may be outside the search).
  const allWindow = useAppointmentsWindow(NO_FILTERS)
  const searchFilters = search
    ? {
        serviceIds: serviceIdsFor(services, search.subject),
        delivery: search.delivery,
        location: search.location,
        radius: search.radius,
      }
    : NO_FILTERS
  // Upcoming lessons from today: finds the next available lesson and backs the
  // "nothing to book" check. The calendar itself loads a month at a time below.
  const searchWindow = useAppointmentsWindow(searchFilters)
  const windowQuery = search ? searchWindow : allWindow
  const appointments = windowQuery.data?.appointments ?? []
  const searchedLocation = windowQuery.data?.location ?? null

  // Next bookable lesson from today: derived, not an effect, so the calendar and
  // its slot list render together instead of popping a frame apart.
  const nextAvailable = useMemo(
    () => appointments.find((a) => dayKey(a.start) >= todayKey() && isBookable(a)) ?? null,
    [appointments],
  )

  // Open on the month of the next lesson until the visitor pages elsewhere.
  const activeMonth =
    month ?? (nextAvailable ? monthKey(dayKey(nextAvailable.start)) : monthKey(todayKey()))
  const monthQuery = useAppointmentsMonth(searchFilters, search ? activeMonth : null)
  const monthAppointments: Appointment[] = monthQuery.data ?? []
  // The chosen day while it's in view; otherwise the month's first bookable day, so
  // paging to a new month always shows something to book.
  const activeDay = useMemo(() => {
    if (selectedDay && monthKey(selectedDay) === activeMonth) return selectedDay
    const today = todayKey()
    const first = monthAppointments.find((a) => dayKey(a.start) >= today && isBookable(a))
    return first ? dayKey(first.start) : null
  }, [selectedDay, activeMonth, monthAppointments])

  // Booking step is routed: #/appointment/<id>-<slug>
  const stripped = loc.pathname.replace(url(''), '').replace(/^\//, '')
  const aptMatch = stripped.match(/^appointment\/(\d+)/)
  const bookingId = aptMatch ? parseInt(aptMatch[1], 10) : null
  const bookingApt: Appointment | null = useMemo(() => {
    if (bookingId === null) return null
    return (
      appointments.find((a) => a.id === bookingId) ??
      monthAppointments.find((a) => a.id === bookingId) ??
      allWindow.data?.appointments.find((a) => a.id === bookingId) ??
      null
    )
  }, [bookingId, appointments, monthAppointments, allWindow.data])

  // --- Step 3: booking ---
  if (bookingId !== null) {
    if (allWindow.isPending) {
      return (
        <div className="tcs-root tw:font-body tw:text-primary">
          <CenteredSpinner message={config.get_text('loading')} />
        </div>
      )
    }
    return (
      <div className="tcs-root tw:font-body tw:text-primary">
        {bookingApt ? (
          <BookingPanel apt={bookingApt} auth={auth} onBack={() => navigate(url(''))} />
        ) : (
          <div className="tw:max-w-lg tw:mx-auto tw:flex tw:flex-col tw:gap-3">
            <Alert variant="warning">
              {config.get_text('appointment_not_found_id', { apt_id: bookingId })}
            </Alert>
            <Button variant="secondary" onClick={() => navigate(url(''))}>
              {config.get_text('apt_back_to_calendar')}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Kept visible while on the bookings tab, even after the last one is cancelled.
  const nav = (
    <BookingsNav
      view={view}
      onChange={setView}
      hasBookings={hasBookings || view === 'bookings'}
    />
  )
  const topRow = (
    <div className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-x-4 tw:gap-y-2">
      {nav}
      <AccountLine auth={auth} className="tw:ml-auto" />
    </div>
  )

  // --- My bookings ---
  if (view === 'bookings') {
    return (
      <div className="tcs-root tw:font-body tw:text-primary tw:flex tw:flex-col tw:gap-4">
        {topRow}
        <MyBookings auth={auth} />
      </div>
    )
  }

  // --- Step 1: search ---
  if (!search || editingSearch) {
    return (
      <div className="tcs-root tw:font-body tw:text-primary tw:flex tw:flex-col tw:gap-4">
        {nav}
        <SearchForm
          services={services}
          initial={search}
          onSearch={(s) => {
            setSearch(s)
            setEditingSearch(false)
            setSelectedDay(null)
            setMonth(null)
          }}
        />
        {/* Under the narrow search card, centred with it. */}
        <AccountLine auth={auth} className="tw:justify-center" />
      </div>
    )
  }

  // --- Step 2: calendar ---
  const subjectServices = services.filter((s) => subjectOf(s) === search.subject)
  // One colour dot when the subject is one service; across tutors there are many.
  const chipColour = subjectServices.length === 1 ? subjectServices[0].colour : null

  // Search context chips, beside the step title. The summary rail only appears once
  // a slot is chosen.
  const searchChips = (
    <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
      <span className="tcs-chip tw:inline-flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:bg-white tw:border tw:border-default tw:rounded-full tw:text-sm tw:font-medium">
        {chipColour && (
          <span
            className="tw:w-2.5 tw:h-2.5 tw:rounded-full tw:shrink-0"
            style={{ background: chipColour }}
          />
        )}
        {search.subject ?? config.get_text('apt_service_placeholder')}
      </span>

      {search.delivery && (
        <span className="tcs-chip tw:px-3 tw:py-1.5 tw:bg-white tw:border tw:border-default tw:rounded-full tw:text-sm">
          {config.get_text(deliveryLabelKey(search.delivery))}
        </span>
      )}
      {search.location && (
        <span className="tcs-chip tw:px-3 tw:py-1.5 tw:bg-white tw:border tw:border-default tw:rounded-full tw:text-sm">
          {searchedLocation?.pretty ?? search.location}
          {search.radius ? ` · ${formatDistanceShort(config, search.radius)}` : ''}
        </span>
      )}
      <button
        type="button"
        onClick={() => setEditingSearch(true)}
        className="tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
      >
        {config.get_text('apt_change_search')}
      </button>
    </div>
  )

  return (
    <div className="tcs-root tw:font-body tw:text-primary tw:flex tw:flex-col tw:gap-4">
      {topRow}
      <FlowLayout
        steps={bookingSteps}
        stepId="time"
        intro={config.get_text('apt_step_time_intro')}
        headerAside={searchChips}
      >
        {windowQuery.isError && (
          <Alert variant="danger">Something went wrong loading lessons. Please try again.</Alert>
        )}

        {searchedLocation?.error === 'no_results' && search.location && (
          <Alert variant="warning">
            {config.get_text('apt_location_not_found', { location: search.location })}
          </Alert>
        )}

        {windowQuery.isPending || monthQuery.isPending ? (
          <CalendarSkeleton />
        ) : (
          <CalendarStep
            appointments={monthAppointments}
            nextAvailable={nextAvailable}
            month={activeMonth}
            onMonthChange={setMonth}
            selectedDay={activeDay}
            onSelectDay={(d) => {
              setSelectedDay(d)
              setMonth(monthKey(d))
            }}
            onBook={(apt) => navigate(url(`appointment/${apt.link}`))}
            attendees={auth.attendees}
            describe={(apt) => {
              const svc = services.find((s) => s.id === apt.service_id)
              return {
                // The subject is already in the chip when one was searched.
                subject: svc && !search.subject ? subjectOf(svc) : null,
                tutor: svc?.contractor ?? null,
              }
            }}
          />
        )}
      </FlowLayout>
    </div>
  )
}

/** Tab strip between booking a lesson and managing existing bookings. */
function BookingsNav({
  view,
  onChange,
  hasBookings,
}: {
  view: 'book' | 'bookings'
  onChange: (v: 'book' | 'bookings') => void
  hasBookings: boolean
}) {
  const config = useConfig()
  // Only surface "My bookings" once there is something to manage.
  if (!hasBookings) return null
  const tabs: Array<{ id: 'book' | 'bookings'; label: string }> = [
    { id: 'book', label: config.get_text('nav_book') },
    { id: 'bookings', label: config.get_text('nav_my_bookings') },
  ]
  return (
    <div className="tw:flex tw:gap-1 tw:border-b tw:border-default">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-selected={view === t.id}
          onClick={() => onChange(t.id)}
          className={`tw:px-3 tw:py-2 tw:text-sm tw:-mb-px tw:border-b-2 tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link ${
            view === t.id
              ? 'tw:border-primary tw:text-primary tw:font-medium'
              : 'tw:border-transparent tw:text-muted-dark tw:hover:text-primary'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
