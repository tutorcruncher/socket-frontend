import { useMemo, useRef, useState } from 'react'
import { useApi, useConfig } from '@/config/context'
import type { Appointment } from '@/api/types'
import type { AppointmentAuth } from '@/lib/useAppointmentAuth'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { CalendarPlusIcon, CalendarTimesIcon, CheckIcon } from '@/components/ui/Icons'

const NEW_STUDENT_ID = 999999999

interface StudentRow {
  id: number
  name: string
  alreadyOnApt: boolean
}

export function AppointmentModal({
  id,
  appointments,
  gotData,
  auth,
  onClose,
}: {
  id: number
  appointments: Appointment[]
  gotData: boolean
  auth: AppointmentAuth
  onClose: () => void
}) {
  const config = useConfig()
  const api = useApi()

  const apt = appointments.find((a) => a.id === id)
  const [newStudent, setNewStudent] = useState('')
  const [bookingAllowed, setBookingAllowed] = useState(true)
  const [extraAttendees, setExtraAttendees] = useState(0)
  // Locally-booked student ids (optimistic, until the next check-client refresh).
  const [localBooked, setLocalBooked] = useState<number[]>([])
  // New students added this session, shown immediately.
  const [addedStudents, setAddedStudents] = useState<Record<number, string>>({})
  const nextNewId = useRef(NEW_STUDENT_ID)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const attendeeIds = useMemo(() => {
    const fromServer = (apt && auth.attendees?.[apt.id]) || []
    return new Set<number>([...fromServer, ...localBooked])
  }, [apt, auth.attendees, localBooked])

  const students = useMemo<StudentRow[]>(() => {
    if (!auth.session) return []
    const all: Record<string, string> = { ...auth.session.srs, ...addedStudents }
    return Object.entries(all).map(([k, name]) => {
      const sid = parseInt(k, 10)
      return { id: sid, name, alreadyOnApt: sid >= NEW_STUDENT_ID || attendeeIds.has(sid) }
    })
  }, [auth.session, addedStudents, attendeeIds])

  if (!gotData) {
    return (
      <Modal title={config.get_text('loading')} onClose={onClose}>
        <CalendarPlusIcon className="tw:w-6 tw:h-6 tw:text-muted" />
      </Modal>
    )
  }

  if (!apt) {
    return (
      <Modal title={config.get_text('appointment_not_found')} onClose={onClose}>
        <p>{config.get_text('appointment_not_found_id', { apt_id: id })}</p>
      </Modal>
    )
  }

  const spacesAvailable =
    apt.attendees_max === null ? null : apt.attendees_max - apt.attendees_count - extraAttendees
  const canBook = bookingAllowed && spacesAvailable !== 0
  const sameDay = apt.start.substr(0, 10) === apt.finish.substr(0, 10)

  const book = async (studentId: number | null) => {
    setBookingAllowed(false)
    const data: Record<string, unknown> = { appointment: apt.id }
    if (studentId) data.student_id = studentId
    else data.student_name = newStudent

    try {
      await api.post('book-appointment', data, { args: auth.ssoArgs ?? undefined })
    } catch {
      setBookingAllowed(true)
      return
    }

    let bookedId = studentId
    if (!studentId) {
      bookedId = nextNewId.current++
      setAddedStudents((prev) => ({ ...prev, [bookedId as number]: newStudent }))
      setNewStudent('')
    }
    setLocalBooked((prev) => [...prev, bookedId as number])
    setExtraAttendees((n) => n + 1)
    setBookingAllowed(true)

    // Give TutorCruncher time to process, then refresh authoritative attendee data.
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => void auth.refreshAttendees(), 5000)
  }

  const CalIcon = spacesAvailable === 0 ? CalendarTimesIcon : CalendarPlusIcon
  const title = (
    <span className="tw:inline-flex tw:items-center tw:gap-2">
      <span className="tw:inline-block tw:w-3 tw:h-3 tw:rounded-full" style={{ background: apt.service_colour }} />
      <span>
        {apt.topic} · {apt.service_name}
      </span>
    </span>
  )

  return (
    <Modal title={title} onClose={onClose}>
      <div className="tw:text-right tw:text-xs tw:text-muted-dark tw:mb-2">
        {config.get_text('assuming_timezone', { timezone: config.timezone })}
      </div>

      <div className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:bg-content tw:border tw:border-default tw:mb-4">
        <CalIcon className={`tw:w-7 tw:h-7 ${spacesAvailable === 0 ? 'tw:text-error' : 'tw:text-success'}`} />
        <div className="tw:flex-1">
          <div className="tw:font-medium">
            {sameDay ? (
              <>
                {config.format_dt(apt.start, 'full')} · {config.format_duration(apt.finish, apt.start)}
              </>
            ) : (
              <>
                {config.format_dt(apt.start, 'full')} – {config.format_dt(apt.finish, 'full')}
              </>
            )}
          </div>
          <div className="tw:text-sm tw:text-muted-dark">{config.get_text('spaces', { spaces: spacesAvailable })}</div>
        </div>
        {apt.price !== null && <div className="tw:text-lg tw:font-semibold">{config.format_money(apt.price)}</div>}
      </div>

      {apt.service_extra_attributes?.map((attr, i) => (
        <div key={i} className="tw:mb-3">
          <h3 className="tw:text-base tw:font-medium tw:font-heading tw:mb-1">{attr.name}</h3>
          {attr.type === 'text_short' || attr.type === 'text_extended' ? (
            <Markdown content={attr.value} />
          ) : (
            <p className="tw:text-sm">{attr.value}</p>
          )}
        </div>
      ))}

      {auth.session ? (
        <div className="tw:flex tw:flex-col tw:gap-4">
          {students.length > 0 && (
            <div>
              <div className="tw:text-sm tw:font-medium tw:mb-2">
                {config.get_text('add_existing_students')}
              </div>
              <div className="tw:flex tw:flex-col tw:gap-2">
                {students.map((s) => (
                  <div key={s.id} className="tw:flex tw:items-center tw:justify-between tw:gap-3">
                    <span className="tw:text-sm">{s.name}</span>
                    {s.alreadyOnApt ? (
                      <span className="tw:inline-flex tw:items-center tw:gap-1 tw:text-sm tw:text-success">
                        {config.get_text('added')} <CheckIcon className="tw:w-3.5 tw:h-3.5" />
                      </span>
                    ) : (
                      <Button size="small" disabled={!canBook} onClick={() => book(s.id)}>
                        {config.get_text('add_to_lesson')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="tw:text-sm tw:font-medium tw:mb-2">{config.get_text('add_new_student')}</div>
            <div className="tw:flex tw:gap-2">
              <input
                type="text"
                placeholder="Student Name"
                maxLength={255}
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                className="tw:flex-1 tw:px-3 tw:py-2 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:placeholder:text-muted-dark tw:focus:outline-2 tw:focus:outline-link"
              />
              <Button disabled={!canBook || !newStudent} onClick={() => book(null)}>
                {config.get_text('add_to_lesson')}
              </Button>
            </div>
          </div>

          <div className="tw:text-sm tw:text-muted-dark tw:pt-2 tw:border-t tw:border-default">
            {auth.session.nm}
            <button
              type="button"
              onClick={auth.signout}
              className="tw:ml-2 tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link tw:focus-visible:outline-offset-2"
            >
              {config.get_text('not_you_sign_out')}
            </button>
          </div>
        </div>
      ) : (
        canBook && (
          <Button onClick={auth.signin}>{config.get_text('book_appointment_button')}</Button>
        )
      )}
    </Modal>
  )
}
