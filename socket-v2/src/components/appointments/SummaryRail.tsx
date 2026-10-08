import { useState } from 'react'
import { useConfig } from '@/config/context'
import type { Appointment, DeliveryMode, Service } from '@/api/types'
import { deliveryLabelKey } from '@/lib/delivery'
import { Markdown } from '@/components/ui/Markdown'
import { CheckIcon } from '@/components/ui/Icons'
import { Photo } from '@/components/shared/Photo'
import { describeTimezone } from '@/lib/formatting'
import { SummaryList, type SummaryRow } from '@/components/shared/SummaryList'

/**
 * Left-hand booking summary. Starts as a service card (photo, blurb, key facts)
 * and accumulates the visitor's choices (date & time, location, student, price)
 * as they move through the flow, so the order being built is always in view.
 */
export function SummaryRail({
  service,
  apt,
  delivery,
  location,
  studentName,
  amount,
  showTotal,
  onChangeSearch,
  onChangeStudent,
  onChangeTime,
}: {
  service: Service | null
  /** The chosen slot; absent while the visitor is still on the calendar. */
  apt?: Appointment | null
  /** Search context shown before a slot is chosen. */
  delivery?: DeliveryMode | null
  /** Pre-formatted searched location, e.g. "Highgate · 5 mi". */
  location?: string | null
  studentName?: string | null
  /** Amount actually due now (deposit or full price). */
  amount?: number | null
  showTotal?: boolean
  onChangeSearch?: () => void
  /** Edit links on the summary rows, offered once the checkout is under way. */
  onChangeStudent?: () => void
  onChangeTime?: () => void
}) {
  const config = useConfig()

  const name = service?.name ?? apt?.service_name ?? config.get_text('apt_service_placeholder')
  const tutor = service?.contractor ?? null
  const colour = tutor ? null : (service?.colour ?? apt?.service_colour ?? null)
  const extraAttrs = apt?.service_extra_attributes ?? service?.extra_attributes ?? []

  const spacesAvailable =
    apt == null || apt.attendees_max === null ? null : apt.attendees_max - apt.attendees_count

  // Key facts, checkmark-listed like a product card.
  const facts: string[] = []
  if (apt) facts.push(config.format_duration(apt.finish, apt.start))
  const activeDelivery = apt?.delivery ?? delivery ?? null
  if (activeDelivery) {
    facts.push(config.get_text(deliveryLabelKey(activeDelivery)))
    if (activeDelivery === 'online') facts.push(config.get_text('apt_online_no_travel'))
    if (activeDelivery === 'home_visit') facts.push(config.get_text('apt_home_visit_fact'))
  } else if (service?.delivery_modes?.length) {
    for (const mode of service.delivery_modes) facts.push(config.get_text(deliveryLabelKey(mode)))
  }
  if (apt) facts.push(config.get_text('spaces', { spaces: spacesAvailable }))

  const searchLocation = !apt && location ? location : null

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {/* A lesson with a tutor leads with their face; otherwise the service photo. */}
      {service && !tutor && <RailPhoto service={service} />}

      <div className="tw:flex tw:items-start tw:gap-3">
        {tutor && (
          <Photo
            src={tutor.photo ?? ''}
            alt={tutor.name}
            className="tw:w-14 tw:h-14 tw:rounded-full tw:overflow-hidden tw:shrink-0 tw:text-base"
          />
        )}
        <div className="tw:min-w-0">
          <h2 className="tw:flex tw:items-center tw:gap-2 tw:text-xl tw:font-medium tw:font-heading">
            {colour && (
              <span
                aria-hidden="true"
                className="tw:w-2.5 tw:h-2.5 tw:rounded-full tw:shrink-0"
                style={{ background: colour }}
              />
            )}
            {name}
          </h2>
          {service?.description && (
            <p className="tw:text-sm tw:text-muted-dark tw:mt-1.5">{service.description}</p>
          )}
        </div>
      </div>

      {extraAttrs.map((attr, i) => (
        <div key={i}>
          <h3 className="tw:text-sm tw:font-semibold tw:font-heading tw:mb-1">{attr.name}</h3>
          {attr.type === 'text_short' || attr.type === 'text_extended' ? (
            <div className="tw:text-sm tw:text-muted-dark">
              <Markdown content={attr.value} />
            </div>
          ) : (
            <p className="tw:text-sm tw:text-muted-dark">{attr.value}</p>
          )}
        </div>
      ))}

      {facts.length > 0 && (
        <ul className="tw:flex tw:flex-col tw:gap-1.5">
          {facts.map((f, i) => (
            <li key={i} className="tw:flex tw:items-start tw:gap-2 tw:text-sm">
              <CheckIcon className="tw:w-3.5 tw:h-3.5 tw:mt-0.5 tw:shrink-0 tw:text-primary" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {(apt || searchLocation) && (
        <BookingSummary
          apt={apt ?? null}
          location={searchLocation}
          studentName={studentName}
          amount={showTotal ? amount : null}
          onChangeStudent={onChangeStudent}
          onChangeTime={onChangeTime}
          className="tw:pt-3 tw:border-t tw:border-default"
        />
      )}

      {apt && (
        <p className="tw:text-xs tw:text-muted-dark">
          {config.get_text('assuming_timezone', { timezone: describeTimezone(config.timezone) })}
        </p>
      )}

      {onChangeSearch && (
        <button
          type="button"
          onClick={onChangeSearch}
          className="tw:self-start tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          {config.get_text('apt_change_search')}
        </button>
      )}
    </div>
  )
}

/**
 * The booking as a label/value list: date, venue, student, price and total. Used
 * in the rail, and inside the Review step on phones where the rail is out of view.
 * `lesson` names the lesson when there is no heading above to do so.
 */
export function BookingSummary({
  apt,
  lesson,
  location,
  studentName,
  amount,
  onChangeStudent,
  onChangeTime,
  className,
}: {
  apt: Appointment | null
  lesson?: string | null
  location?: string | null
  studentName?: string | null
  /** Total due now; omitted until the checkout is under way. */
  amount?: number | null
  onChangeStudent?: () => void
  onChangeTime?: () => void
  className?: string
}) {
  const config = useConfig()
  const sameDay = apt ? apt.start.substring(0, 10) === apt.finish.substring(0, 10) : true
  // A home visit's address is the tutor's base, which is not where the lesson is.
  const aptLocation = !apt
    ? null
    : apt.delivery === 'home_visit'
      ? config.get_text('apt_your_home')
      : apt.delivery !== 'online'
        ? (apt.address?.pretty ?? apt.location ?? null)
        : null

  const rows: SummaryRow[] = []
  if (lesson) rows.push({ label: config.get_text('apt_summary_lesson'), value: lesson })
  if (apt) {
    rows.push({
      label: config.get_text('apt_summary_date'),
      value: sameDay
        ? config.format_dt(apt.start, 'full')
        : `${config.format_dt(apt.start, 'full')} – ${config.format_dt(apt.finish, 'full')}`,
      onChange: onChangeTime,
    })
  }
  const venue = aptLocation ?? location
  if (venue) rows.push({ label: config.get_text('apt_summary_location'), value: venue })
  if (studentName)
    rows.push({
      label: config.get_text('apt_summary_student'),
      value: studentName,
      onChange: onChangeStudent,
    })
  if (apt && apt.price !== null)
    rows.push({ label: config.get_text('apt_summary_price'), value: config.format_money(apt.price) })

  return (
    <SummaryList
      rows={rows}
      total={
        amount != null
          ? {
              // Less than the price is due now (deposit, or invoiced later): say so.
              label: config.get_text(
                apt && apt.price !== null && amount !== apt.price ? 'apt_due_today' : 'apt_total_due',
              ),
              value: config.format_money(amount),
            }
          : null
      }
      className={className}
    />
  )
}

/** Service photo, when the tenant has set one; nothing otherwise (a placeholder
 *  block would be most of what parents see, since few services have a photo). */
function RailPhoto({ service }: { service: Service }) {
  const [failed, setFailed] = useState(false)
  if (!service.photo || failed) return null
  return (
    <img
      src={service.photo}
      alt={service.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="tw:w-full tw:aspect-[4/3] tw:object-cover tw:rounded-lg"
    />
  )
}
