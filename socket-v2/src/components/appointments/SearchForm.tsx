import { useMemo, useState } from 'react'
import { useConfig } from '@/config/context'
import { useAppointmentsWindow } from '@/api/queries'
import { dayKey, todayKey } from '@/lib/calendar'
import { Alert } from '@/components/ui/Alert'
import type { DeliveryMode, Service } from '@/api/types'
import { Combobox, type ComboboxItem } from '@/components/ui/Combobox'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils'
import {
  DELIVERY_MODES,
  RADIUS_OPTIONS,
  deliveryHelpKey,
  deliveryLabelKey,
  formatDistanceShort,
} from '@/lib/delivery'
import { LocationIcon, SearchIcon, VideoIcon } from '@/components/ui/Icons'
import { groupBySubject, serviceIdsFor } from '@/lib/services'

export interface AppointmentSearch {
  /**
   * Subject name; null for all lesson types. Parents search by subject, not tutor:
   * they don't know the tutors yet, so every tutor's lessons are included.
   */
  subject: string | null
  delivery: DeliveryMode | null
  location: string | null
  radius: number | null
}

const MODE_ICONS = { online: VideoIcon, in_person: LocationIcon }

/** Sentinel for the explicit "all lesson types" choice in the subject box. */
const ALL_SUBJECTS = '__all__'

/**
 * Step 1: "what are you looking for?" A parent picks the lesson type, how they'd
 * like it delivered, and (for in-person / home visits) where they are.
 */
export function SearchForm({
  services,
  initial,
  onSearch,
}: {
  services: Service[]
  initial: AppointmentSearch | null
  onSearch: (search: AppointmentSearch) => void
}) {
  const config = useConfig()
  const [subject, setSubject] = useState<string | null>(
    initial ? (initial.subject ?? ALL_SUBJECTS) : null,
  )
  const [delivery, setDelivery] = useState<DeliveryMode | null>(initial?.delivery ?? null)
  const [location, setLocation] = useState(initial?.location ?? '')
  const [radius, setRadius] = useState<number>(initial?.radius ?? 25000)
  const [submitted, setSubmitted] = useState(false)

  const subjects = useMemo(() => groupBySubject(services), [services])
  const searchSubject = subject === ALL_SUBJECTS ? null : subject
  const serviceIds = serviceIdsFor(services, searchSubject)

  // Upcoming lessons for the chosen type, so a parent learns there is nothing to
  // book before clicking through. Same query key the calendar uses for an
  // unlocated search, so this doubles as a prefetch.
  const availability = useAppointmentsWindow({
    serviceIds,
    delivery: null,
    location: null,
    radius: null,
  })
  const modeCounts = useMemo(() => {
    if (!availability.data) return null
    const today = todayKey()
    const counts: Record<DeliveryMode, number> = { online: 0, in_person: 0 }
    for (const a of availability.data.appointments) {
      const full = a.attendees_max !== null && a.attendees_max - a.attendees_count <= 0
      if (dayKey(a.start) >= today && !full) counts[a.delivery ?? 'in_person'] += 1
    }
    return counts
  }, [availability.data])
  const noLessons = !!modeCounts && modeCounts.online + modeCounts.in_person === 0

  // "All lesson types" is a real choice, listed first, so the box never reads as
  // if something has been picked when it hasn't. Choosing it stores ALL_SUBJECTS;
  // the search itself sees null.
  const items = useMemo<ComboboxItem[]>(
    () => [
      { id: ALL_SUBJECTS, label: config.get_text('apt_service_placeholder') },
      ...subjects.map((g) => ({ id: g.name, label: g.name })),
    ],
    [subjects, config],
  )
  const selected = useMemo(() => items.find((i) => i.id === subject) ?? null, [items, subject])

  // Only offer delivery modes some tutor of the chosen subject offers.
  const modesFor = (ids: number[] | null) => {
    if (!ids) return DELIVERY_MODES
    const set = new Set(
      services.filter((s) => ids.includes(s.id)).flatMap((s) => s.delivery_modes ?? DELIVERY_MODES),
    )
    return DELIVERY_MODES.filter((m) => set.has(m))
  }
  const availableModes = modesFor(serviceIds)

  // With a single option there is no choice to make: select it for the parent.
  const onlyMode = availableModes.length === 1 ? availableModes[0] : null
  // A remembered choice the new lesson type has no lessons for is dropped, not kept.
  const chosenDelivery = delivery && modeCounts?.[delivery] === 0 ? null : delivery
  const effectiveDelivery = onlyMode ?? chosenDelivery

  // Location only matters when travel is involved. Hidden entirely when the lesson
  // can only be online, since there is nothing to search against.
  const needsLocation =
    effectiveDelivery !== 'online' && !(onlyMode === 'online')
  // In person means travelling to a venue, so we need to know where from.
  const locationRequired = effectiveDelivery === 'in_person'
  const locationMissing = locationRequired && !location.trim()

  return (
    <div className="tw:max-w-lg tw:mx-auto tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:p-6">
      <h2 className="tw:text-xl tw:font-medium tw:font-heading tw:mb-1">
        {config.get_text('apt_search_title')}
      </h2>
      <p className="tw:text-sm tw:text-muted-dark tw:mb-5">{config.get_text('apt_search_intro')}</p>

      <form
        className="tw:flex tw:flex-col tw:gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
          if (noLessons || locationMissing) return
          onSearch({
            subject: searchSubject,
            delivery: effectiveDelivery,
            location: needsLocation && location.trim() ? location.trim() : null,
            radius: needsLocation && location.trim() ? radius : null,
          })
        }}
      >
        <div className="tw:flex tw:flex-col tw:gap-1">
          <label className="tw:text-sm tw:font-medium">{config.get_text('apt_service_label')}</label>
          <Combobox
            items={items}
            value={selected}
            onChange={(item) => {
              // Keep the delivery choice when switching lesson type, as long as the
              // new type offers it.
              const next = item ? String(item.id) : null
              setSubject(next)
              const forSearch = next === ALL_SUBJECTS ? null : next
              if (delivery && !modesFor(serviceIdsFor(services, forSearch)).includes(delivery)) {
                setDelivery(null)
              }
            }}
            placeholder={config.get_text('apt_service_choose')}
          />
        </div>


        {noLessons && (
          <Alert variant="warning">
            {searchSubject
              ? config.get_text('apt_no_service_lessons', { service: searchSubject })
              : config.get_text('apt_no_lessons_any')}
          </Alert>
        )}

        {noLessons ? null : onlyMode ? (
          // Single option: state it rather than offering a choice of one.
          <div className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2.5 tw:bg-info tw:border tw:border-info tw:rounded-lg">
            {(() => {
              const Icon = MODE_ICONS[onlyMode]
              return <Icon className="tw:w-4 tw:h-4 tw:text-info tw:shrink-0" />
            })()}
            <span className="tw:text-sm tw:text-info">
              <span className="tw:font-medium">{config.get_text(deliveryLabelKey(onlyMode))}</span>
              {' · '}
              {config.get_text(deliveryHelpKey(onlyMode))}
            </span>
          </div>
        ) : (
          <fieldset className="tw:flex tw:flex-col tw:gap-2">
            <legend className="tw:text-sm tw:font-medium tw:mb-2">
              {config.get_text('delivery_label')}
            </legend>
            <div
              className={cx(
                'tw:grid tw:gap-2',
                availableModes.length === 2 ? 'tw:grid-cols-2' : 'tw:grid-cols-3',
              )}
            >
              {availableModes.map((mode) => {
                const Icon = MODE_ICONS[mode]
                const active = chosenDelivery === mode
                const unavailable = modeCounts?.[mode] === 0
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={active}
                    disabled={unavailable}
                    onClick={() => setDelivery(active ? null : mode)}
                    className={cx(
                      'tw:flex tw:flex-col tw:items-center tw:gap-1.5 tw:px-2 tw:py-3 tw:rounded-lg tw:border tw:text-center tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
                      unavailable
                        ? 'tw:border-default tw:bg-content tw:text-muted-dark tw:cursor-not-allowed'
                        : active
                          ? 'tw:border-link tw:bg-info tw:text-link tw:cursor-pointer'
                          : 'tw:border-default tw:bg-white tw:hover:bg-hover tw:cursor-pointer',
                    )}
                  >
                    <Icon className="tw:w-4 tw:h-4" />
                    <span className="tw:text-xs tw:font-medium tw:leading-tight">
                      {config.get_text(deliveryLabelKey(mode))}
                    </span>
                    {unavailable && (
                      <span className="tw:text-xs tw:leading-tight">
                        {config.get_text('apt_mode_unavailable')}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {chosenDelivery && (
              <p className="tw:text-xs tw:text-muted-dark">
                {config.get_text(deliveryHelpKey(chosenDelivery))}
              </p>
            )}
          </fieldset>
        )}

        {needsLocation && !noLessons && (
          <div className="tw:flex tw:flex-col tw:gap-2">
            <label
              htmlFor={`tcs-${config.random_id}-apt-loc`}
              className="tw:text-sm tw:font-medium"
            >
              {config.get_text('apt_address_label')}
            </label>
            <div className="tw:relative">
              <SearchIcon className="tw:w-4 tw:h-4 tw:text-muted-dark tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none" />
              <input
                id={`tcs-${config.random_id}-apt-loc`}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={config.get_text('apt_address_placeholder')}
                aria-required={locationRequired}
                aria-invalid={submitted && locationMissing}
                className={cx(
                  'tw:w-full tw:pl-9 tw:pr-3 tw:py-2 tw:text-sm tw:bg-white tw:border tw:rounded-lg tw:shadow-sm tw:placeholder:text-muted-dark tw:focus:outline-2 tw:focus:outline-link',
                  submitted && locationMissing ? 'tw:border-error' : 'tw:border-default',
                )}
              />
            </div>
            {submitted && locationMissing && (
              <p className="tw:text-xs tw:text-error">{config.get_text('apt_address_required')}</p>
            )}
            {location.trim() && (
              <div className="tw:flex tw:items-center tw:gap-2">
                <label
                  htmlFor={`tcs-${config.random_id}-apt-radius`}
                  className="tw:text-sm tw:text-muted-dark"
                >
                  {config.get_text('apt_radius_label')}
                </label>
                <select
                  id={`tcs-${config.random_id}-apt-radius`}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="tw:px-3 tw:py-1.5 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:focus:outline-2 tw:focus:outline-link"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {formatDistanceShort(config, r)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="tw:w-full" disabled={noLessons}>
          {config.get_text('apt_search_button')}
        </Button>
      </form>
    </div>
  )
}
