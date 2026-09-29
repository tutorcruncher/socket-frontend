import type { Appointment } from '@/api/types'

/** Escape per RFC 5545: backslash, semicolon, comma and newline are special. */
const esc = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** "2026-08-03T09:00:00" (UTC per the API) -> "20260803T090000Z" */
const stamp = (ts: string) => ts.replace(/[-:]/g, '').replace(/\.\d+$/, '') + 'Z'

/**
 * Build an iCalendar file for a booked lesson so parents can add it to their
 * calendar: one of the cheapest ways to cut no-shows.
 */
export function buildIcs(apt: Appointment, organiser?: string): string {
  const where =
    apt.delivery === 'online'
      ? 'Online'
      : (apt.address?.pretty ?? apt.location ?? '')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TutorCruncher//Socket//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:tcs-${apt.id}@tutorcruncher.com`,
    `DTSTAMP:${stamp(new Date().toISOString().replace(/\.\d+Z$/, ''))}`,
    `DTSTART:${stamp(apt.start)}`,
    `DTEND:${stamp(apt.finish)}`,
    `SUMMARY:${esc(apt.service_name)}`,
    where ? `LOCATION:${esc(where)}` : '',
    organiser ? `ORGANIZER;CN=${esc(organiser)}:MAILTO:noreply@tutorcruncher.com` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/** Trigger a download of the .ics for an appointment. */
export function downloadIcs(apt: Appointment, organiser?: string): void {
  const blob = new Blob([buildIcs(apt, organiser)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lesson-${apt.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick so the click has been handled.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
