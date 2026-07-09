import { useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import { useAppointments } from '@/api/queries'
import { useAppointmentAuth } from '@/lib/useAppointmentAuth'
import { colourContrast, groupBy, cx } from '@/lib/utils'
import type { Appointment } from '@/api/types'
import { CenteredSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Alert } from '@/components/ui/Alert'
import { Pagination } from '@/components/contractors/Pagination'
import { CalendarPlusIcon } from '@/components/ui/Icons'
import { AppointmentModal } from './AppointmentModal'

const parsePage = (path: string): number => {
  const m = path.match(/page\/(\d+)/)
  return m ? parseInt(m[1], 10) : 1
}

/** Group appointments by month, then by day, preserving chronological order. */
function groupByMonth(apts: Appointment[]) {
  return groupBy(apts, (a) => a.start.substr(0, 7)).map((monthApts) => ({
    date: monthApts[0].start,
    days: groupBy(monthApts, (a) => a.start.substr(0, 10)),
  }))
}

export function Appointments() {
  const config = useConfig()
  const url = useUrl()
  const navigate = useNavigate()
  const loc = useLocation()
  const auth = useAppointmentAuth()

  const stripped = loc.pathname.replace(url(''), '').replace(/^\//, '')
  const aptMatch = stripped.match(/^appointment\/(\d+)/)
  const aptId = aptMatch ? parseInt(aptMatch[1], 10) : null

  // Freeze the page while a modal is open so the list behind doesn't refetch
  // (the appointment URL no longer encodes the page).
  const pageRef = useRef(parsePage(loc.pathname))
  if (aptId === null) pageRef.current = parsePage(loc.pathname)
  const page = pageRef.current
  const { data: response, isFetching, isError } = useAppointments(page)

  const pageUrl = (p: number) => url(p > 1 ? `page/${p}` : '')
  const results = response?.results ?? []
  const months = groupByMonth(results)
  const hasMore =
    !!response && response.count > results.length + (page - 1) * config.pagination

  return (
    <div className="tcs-root tw:font-body tw:text-primary">
      {isError && <Alert variant="danger">Something went wrong loading appointments.</Alert>}

      {!response && isFetching ? (
        <CenteredSpinner />
      ) : results.length === 0 ? (
        <EmptyState
          title="No upcoming appointments"
          description="There are no lessons available to book right now."
          icon={<CalendarPlusIcon className="tw:w-10 tw:h-10" />}
        />
      ) : (
        <div className={cx('tw:flex tw:flex-col tw:gap-6', isFetching && 'tw:opacity-60')}>
          {months.map((month, i) => (
            <div key={i}>
              <h3 className="tw:text-sm tw:font-semibold tw:font-heading tw:text-muted-dark tw:uppercase tw:tracking-wider tw:mb-2">
                {config.format_dt(month.date, 'month')}
              </h3>
              <div className="tw:flex tw:flex-col tw:gap-4">
                {month.days.map((day, j) => (
                  <DayGroup key={j} appointments={day} attendees={auth.attendees} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} hasMore={hasMore} onChange={(p) => navigate(pageUrl(p))} />

      {aptId !== null && (
        <AppointmentModal
          id={aptId}
          appointments={results}
          gotData={!!response}
          auth={auth}
          onClose={() => navigate(url(''))}
        />
      )}
    </div>
  )
}

function DayGroup({
  appointments,
  attendees,
}: {
  appointments: Appointment[]
  attendees: Record<number, number[]> | null
}) {
  const config = useConfig()
  const first = appointments[0]
  return (
    <div className="tw:flex tw:gap-3">
      <div className="tw:shrink-0 tw:w-12 tw:text-center">
        <div className="tw:text-xs tw:text-muted-dark tw:uppercase">
          {config.format_dt(first.start, 'weekday')}
        </div>
        <div className="tw:text-2xl tw:font-medium tw:font-heading tw:text-heading tw:leading-tight">
          {config.format_dt(first.start, 'day')}
        </div>
      </div>
      <div className="tw:flex-1 tw:flex tw:flex-col tw:gap-2 tw:min-w-0">
        {appointments.map((apt) => (
          <AppointmentRow key={apt.id} apt={apt} attendees={attendees} />
        ))}
      </div>
    </div>
  )
}

function AppointmentRow({
  apt,
  attendees,
}: {
  apt: Appointment
  attendees: Record<number, number[]> | null
}) {
  const config = useConfig()
  const url = useUrl()
  const onDark = colourContrast(apt.service_colour) === 'dark'
  const spaces = apt.attendees_max === null ? null : apt.attendees_max - apt.attendees_count
  const isAttending = !!attendees && attendees[apt.id] !== undefined
  const status = isAttending
    ? config.get_text('spaces_attending', { spaces })
    : config.get_text('spaces', { spaces })

  return (
    <Link
      to={url(`appointment/${apt.link}`)}
      className="tw:block tw:rounded-lg tw:overflow-hidden tw:shadow-sm tw:transition-transform tw:hover:scale-[1.01] tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link tw:focus-visible:outline-offset-2"
      style={{ background: apt.service_colour, color: onDark ? '#fff' : '#1f374e' }}
    >
      <div className="tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2">
        <div className="tw:font-semibold tw:tabular-nums tw:shrink-0 tw:w-16">
          {config.format_dt(apt.start, 'time')}
        </div>
        <div className="tw:flex-1 tw:min-w-0">
          <div className="tw:truncate tw:font-medium">
            {apt.topic} · {apt.service_name}
          </div>
          <div className="tw:truncate tw:text-xs tw:opacity-90">{status}</div>
        </div>
        <div className="tw:text-right tw:shrink-0">
          {apt.price !== null && <div className="tw:font-semibold">{config.format_money(apt.price)}</div>}
          <div className="tw:text-xs tw:opacity-90">
            {config.format_duration(apt.finish, apt.start)}
          </div>
        </div>
      </div>
    </Link>
  )
}
