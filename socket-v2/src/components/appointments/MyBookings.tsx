import { useState } from 'react'
import { useApi, useConfig } from '@/config/context'
import type { ClientBooking } from '@/api/types'
import type { AppointmentAuth } from '@/lib/useAppointmentAuth'
import { getMockBookings } from '@/api/mock'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeliveryBadge } from './DeliveryBadge'
import { CalendarPlusIcon, LocationIcon } from '@/components/ui/Icons'
import { Photo } from '@/components/shared/Photo'
import { downloadIcs } from '@/lib/ics'
import type { Appointment } from '@/api/types'

/**
 * Upcoming lessons the client has booked, with self-service cancellation, so a
 * parent never has to email the agency or log into TutorCruncher to change a booking.
 *
 * Reads from the mock store while `GET /{key}/bookings` is unbuilt (ROADMAP §3.6).
 */
export function MyBookings({ auth }: { auth: AppointmentAuth }) {
  const config = useConfig()
  const api = useApi()
  const [bookings, setBookings] = useState<ClientBooking[]>(() => getMockBookings())
  const [cancelling, setCancelling] = useState<string | null>(null)
  // Booking awaiting a yes/no on cancellation; inline rather than a browser dialog.
  const [confirming, setConfirming] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cancel = async (b: ClientBooking) => {
    setConfirming(null)
    setCancelling(b.booking_id)
    setError(null)
    try {
      await api.post(`bookings/${b.booking_id}/cancel`)
      setBookings((prev) => prev.filter((x) => x.booking_id !== b.booking_id))
      setNotice(config.get_text('bookings_cancelled'))
      void auth.refreshAttendees()
    } catch {
      setError('We could not cancel this booking. Please contact us.')
    } finally {
      setCancelling(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="tw:flex tw:flex-col tw:gap-3">
        {notice && <Alert variant="success">{notice}</Alert>}
        <EmptyState
          title={config.get_text('bookings_none')}
          description={config.get_text('bookings_none_desc')}
          icon={<CalendarPlusIcon className="tw:w-10 tw:h-10" />}
        />
      </div>
    )
  }

  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      {notice && <Alert variant="success">{notice}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {bookings.map((b) => (
        <div
          key={b.booking_id}
          className="tw:flex tw:items-start tw:gap-3 tw:p-3 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm"
        >
          {b.contractor && (
            <Photo
              src={b.contractor.photo ?? ''}
              alt={b.contractor.name}
              className="tw:w-10 tw:h-10 tw:rounded-full tw:overflow-hidden tw:shrink-0 tw:text-sm"
            />
          )}
          <div className="tw:flex-1 tw:min-w-0">
            <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
              <span className="tw:font-medium tw:truncate">{b.service_name}</span>
              {b.delivery && <DeliveryBadge mode={b.delivery} />}
            </div>
            <div className="tw:text-sm tw:text-muted-dark tw:mt-0.5">
              {config.format_dt(b.start, 'full')} · {b.student_name}
            </div>
            {b.delivery === 'in_person' && b.address?.pretty && (
              <div className="tw:inline-flex tw:items-center tw:gap-1 tw:text-xs tw:text-muted-dark tw:mt-1">
                <LocationIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
                <span className="tw:truncate">{b.address.pretty}</span>
              </div>
            )}
            {confirming === b.booking_id ? (
              <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mt-2 tw:text-sm">
                <span>
                  {config.get_text('bookings_cancel_confirm', { student_name: b.student_name })}
                </span>
                <Button size="small" variant="danger" onClick={() => void cancel(b)}>
                  {config.get_text('bookings_cancel_yes')}
                </Button>
                <Button size="small" variant="secondary" onClick={() => setConfirming(null)}>
                  {config.get_text('bookings_cancel_keep')}
                </Button>
              </div>
            ) : (
              <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mt-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => downloadIcs(bookingToAppointment(b), config.name)}
                >
                  {config.get_text('apt_add_to_calendar')}
                </Button>
                {b.can_cancel ? (
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={cancelling === b.booking_id}
                    onClick={() => setConfirming(b.booking_id)}
                  >
                    {config.get_text('bookings_cancel')}
                  </Button>
                ) : (
                  <span className="tw:text-xs tw:text-muted-dark">
                    {config.get_text('bookings_cannot_cancel')}
                  </span>
                )}
              </div>
            )}
          </div>
          {b.price !== null && (
            <div className="tw:font-semibold tw:shrink-0">{config.format_money(b.price)}</div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Minimal shape needed by the .ics builder. */
function bookingToAppointment(b: ClientBooking): Appointment {
  return {
    id: b.appointment,
    start: b.start,
    finish: b.finish,
    topic: b.service_name,
    service_id: 0,
    service_name: b.service_name,
    service_colour: b.service_colour,
    price: b.price,
    attendees_max: null,
    attendees_count: 0,
    link: String(b.appointment),
    delivery: b.delivery,
    address: b.address,
  }
}
