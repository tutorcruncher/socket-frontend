import { useMemo, useState } from 'react'
import { useConfig } from '@/config/context'
import { useQualLevels, useSubjects } from '@/api/queries'
import type { DeliveryMode, EnquiryField } from '@/api/types'
import { DELIVERY_MODES, deliveryLabelKey } from '@/lib/delivery'
import { cx } from '@/lib/utils'
import { FlowLayout, type FlowStep } from '@/components/shared/FlowLayout'
import { SummaryList, type SummaryRow } from '@/components/shared/SummaryList'
import { DeliveryToggle } from '@/components/shared/DeliveryToggle'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxItem } from '@/components/ui/Combobox'
import { CheckIcon } from '@/components/ui/Icons'
import { FIELD_BASE, FIELD_BORDER, FIELD_BORDER_ERROR, FIELD_LABEL } from '@/components/ui/fieldStyles'
import { EnquiryForm } from './EnquiryForm'
import { AvailabilityGrid, DAYS, PERIODS, dayName, timeKey, toPreferredTimes } from './AvailabilityGrid'

type Step = 'subject' | 'times' | 'details' | 'sent'

/** What the flow can be opened with, e.g. a booking search that found nothing. */
export interface SubjectEnquiryInitial {
  subjectName?: string | null
  delivery?: DeliveryMode | null
  location?: string | null
}

/**
 * Contact fields, plus any custom field the tenant made required. A tenant's
 * optional custom fields are left out: several repeat what this flow already
 * asks (subject, year group), and the rest belong to the general enquiry form.
 */
const contactFields = (field: EnquiryField) => !field.prefix || field.required

/** "Mon morning, evening · Sat morning", or "Any time" when nothing is ticked. */
function describeTimes(selected: Set<string>, anyTime: string, periodLabel: (p: string) => string) {
  if (selected.size === 0 || selected.size === DAYS.length * PERIODS.length) return anyTime
  return DAYS.map((day, i) => {
    const periods = PERIODS.filter((p) => selected.has(timeKey(day, p)))
    return periods.length
      ? `${dayName(i, 'short')} ${periods.map((p) => periodLabel(p).toLowerCase()).join(', ')}`
      : null
  })
    .filter(Boolean)
    .join(' · ')
}

/** Mode root for `subject-enquiry`. */
export function SubjectEnquiry() {
  return (
    <div className="tcs-root tw:font-body tw:text-primary">
      <SubjectEnquiryFlow />
    </div>
  )
}

/**
 * Lesson request: for a parent who wants tuition in a subject but has not found
 * (or does not want) a fixed lesson to book.
 *
 *   subject → what they need: subject, level, online or in person
 *   times   → when they are usually free, on a weekly grid
 *   details → how to reach them (the tenant's enquiry contact fields)
 *   sent    → what was asked for
 *
 * Posts to `subject-enquiry`, which is mocked (ROADMAP §3.9). It never calls the
 * general `enquiry` endpoint. Rendered without a root so the booking flow can
 * embed it when a search finds nothing suitable.
 */
export function SubjectEnquiryFlow({
  initial,
  onExit,
}: {
  initial?: SubjectEnquiryInitial
  /** Present when embedded in another flow: the way back to it. */
  onExit?: () => void
}) {
  const config = useConfig()
  const uid = config.random_id
  const { data: subjects = [] } = useSubjects()
  const { data: levels = [] } = useQualLevels()

  const [step, setStep] = useState<Step>('subject')
  // Once shown, the details form stays mounted so Back does not lose what was typed.
  const [detailsShown, setDetailsShown] = useState(false)
  const [subject, setSubject] = useState<ComboboxItem | null>(null)
  const [subjectTouched, setSubjectTouched] = useState(false)
  const [level, setLevel] = useState<number | null>(null)
  const [delivery, setDelivery] = useState<DeliveryMode | null>(initial?.delivery ?? null)
  const [location, setLocation] = useState(initial?.location ?? '')
  const [times, setTimes] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const items = useMemo<ComboboxItem[]>(() => {
    const list: ComboboxItem[] = subjects.map((s) => ({ id: s.id, label: s.name }))
    // A subject carried in from a booking search may not be in the tenant's subject
    // list (services are named freely), so it is offered by name alone.
    const carried = initial?.subjectName
    if (carried && !list.some((i) => i.label.toLowerCase() === carried.toLowerCase())) {
      list.unshift({ id: `name:${carried}`, label: carried })
    }
    return list
  }, [subjects, initial?.subjectName])

  // The carried-in subject is the starting choice until the visitor picks another.
  const chosen =
    subject ??
    (subjectTouched
      ? null
      : (items.find((i) => i.label.toLowerCase() === initial?.subjectName?.toLowerCase()) ?? null))

  const levelName = levels.find((l) => l.id === level)?.name ?? null
  const needsLocation = delivery !== 'online'
  const locationMissing = delivery === 'in_person' && !location.trim()
  const timesText = describeTimes(times, config.get_text('req_any_time'), (p) =>
    config.get_text(`apt_${p}`),
  )

  const steps: FlowStep[] = [
    { id: 'subject', label: config.get_text('req_step_subject') },
    { id: 'times', label: config.get_text('req_step_times') },
    { id: 'details', label: config.get_text('apt_step_details') },
    { id: 'sent', label: config.get_text('req_step_sent') },
  ]
  const titles: Record<Step, string | undefined> = {
    subject: config.get_text('req_subject_title'),
    times: config.get_text('req_times_title'),
    details: undefined,
    sent: config.get_text('req_sent_title'),
  }
  const intros: Record<Step, string | undefined> = {
    subject: config.get_text('req_subject_intro'),
    times: config.get_text('req_times_intro'),
    details: config.get_text('req_details_intro'),
    sent: undefined,
  }

  const editable = step !== 'sent'
  const rows: SummaryRow[] = []
  if (chosen)
    rows.push({
      label: config.get_text('req_summary_subject'),
      value: chosen.label,
      onChange: editable && step !== 'subject' ? () => setStep('subject') : undefined,
    })
  if (levelName) rows.push({ label: config.get_text('req_summary_level'), value: levelName })
  if (delivery)
    rows.push({
      label: config.get_text('req_summary_delivery'),
      value: config.get_text(deliveryLabelKey(delivery)),
    })
  if (needsLocation && location.trim())
    rows.push({ label: config.get_text('apt_summary_location'), value: location.trim() })
  if (step !== 'subject')
    rows.push({
      label: config.get_text('req_summary_times'),
      value: timesText,
      onChange: editable && step !== 'times' ? () => setStep('times') : undefined,
    })

  const toTimes = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!chosen || locationMissing) return
    setStep('times')
  }

  const reset = () => {
    setSubject(null)
    setSubjectTouched(true)
    setLevel(null)
    setTimes(new Set())
    setNotes('')
    setSubmitted(false)
    setDetailsShown(false)
    setStep('subject')
  }

  return (
    <FlowLayout
      steps={steps}
      stepId={step}
      title={titles[step]}
      intro={intros[step]}
      back={
        onExit && step !== 'sent'
          ? { label: config.get_text('req_back_to_booking'), onClick: onExit }
          : undefined
      }
      rail={
        step === 'sent' ? undefined : (
          <div className="tw:flex tw:flex-col tw:gap-3">
            <h2 className="tw:text-xl tw:font-medium tw:font-heading">
              {config.get_text('req_rail_title')}
            </h2>
            {rows.length > 0 ? (
              <SummaryList rows={rows} />
            ) : (
              <p className="tw:text-sm tw:text-muted-dark">{config.get_text('req_rail_empty')}</p>
            )}
          </div>
        )
      }
      // On a phone the rail only earns its place beside the final form.
      railOnMobile={step === 'details'}
    >
      {step === 'subject' && (
        <form onSubmit={toTimes} noValidate className="tw:flex tw:flex-col tw:gap-5">
          <div className="tw:flex tw:flex-col tw:gap-1">
            <label className={FIELD_LABEL}>{config.get_text('req_subject_label')}</label>
            <Combobox
              items={items}
              value={chosen}
              onChange={(item) => {
                setSubject(item)
                setSubjectTouched(true)
              }}
              placeholder={config.get_text('apt_service_choose')}
            />
            {submitted && !chosen && (
              <p className="tw:text-xs tw:text-error">{config.get_text('req_subject_required')}</p>
            )}
          </div>

          {levels.length > 0 && (
            <div className="tw:flex tw:flex-col tw:gap-1">
              <label htmlFor={`tcs-${uid}-req-level`} className={FIELD_LABEL}>
                {config.get_text('req_level_label')}
              </label>
              <select
                id={`tcs-${uid}-req-level`}
                value={level ?? ''}
                onChange={(e) => setLevel(e.target.value ? Number(e.target.value) : null)}
                className={cx(FIELD_BASE, FIELD_BORDER, 'tw:w-full')}
              >
                <option value="">{config.get_text('req_level_any')}</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset className="tw:flex tw:flex-col tw:gap-2">
            <legend className="tw:text-sm tw:font-medium tw:mb-2">
              {config.get_text('req_delivery_label')}
            </legend>
            <DeliveryToggle modes={DELIVERY_MODES} value={delivery} onChange={setDelivery} />
          </fieldset>

          {needsLocation && (
            <div className="tw:flex tw:flex-col tw:gap-1">
              <label htmlFor={`tcs-${uid}-req-loc`} className={FIELD_LABEL}>
                {config.get_text('apt_address_label')}
                {delivery !== 'in_person' && config.get_text('apt_optional')}
              </label>
              <input
                id={`tcs-${uid}-req-loc`}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={config.get_text('apt_address_placeholder')}
                aria-invalid={submitted && locationMissing}
                className={cx(
                  FIELD_BASE,
                  'tw:w-full',
                  submitted && locationMissing ? FIELD_BORDER_ERROR : FIELD_BORDER,
                )}
              />
              {submitted && locationMissing && (
                <p className="tw:text-xs tw:text-error">{config.get_text('apt_address_required')}</p>
              )}
            </div>
          )}

          <Button type="submit" className="tw:py-2.5">
            {config.get_text('apt_details_continue')}
          </Button>
        </form>
      )}

      {step === 'times' && (
        <div className="tw:flex tw:flex-col tw:gap-5">
          <AvailabilityGrid value={times} onChange={setTimes} />

          <div className="tw:flex tw:flex-col tw:gap-1">
            <label htmlFor={`tcs-${uid}-req-notes`} className={FIELD_LABEL}>
              {config.get_text('req_time_notes_label')}
            </label>
            <textarea
              id={`tcs-${uid}-req-notes`}
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cx(FIELD_BASE, FIELD_BORDER, 'tw:w-full')}
            />
          </div>

          <div className="tw:flex tw:gap-2 tw:pt-2 tw:border-t tw:border-default">
            <Button variant="secondary" onClick={() => setStep('subject')} className="tw:py-2.5">
              {config.get_text('apt_back')}
            </Button>
            <Button
              onClick={() => {
                setDetailsShown(true)
                setStep('details')
              }}
              className="tw:flex-1 tw:py-2.5"
            >
              {config.get_text('apt_details_continue')}
            </Button>
          </div>
        </div>
      )}

      {detailsShown && (
        <div className={step === 'details' ? undefined : 'tw:hidden'}>
          <EnquiryForm
            mode="subject"
            endpoint="subject-enquiry"
            fieldFilter={contactFields}
            extra={{
              subject: typeof chosen?.id === 'number' ? chosen.id : null,
              subject_name: chosen?.label ?? null,
              qual_level: level ?? undefined,
              delivery,
              location: needsLocation && location.trim() ? location.trim() : undefined,
              preferred_times: toPreferredTimes(times),
              time_notes: notes.trim() || undefined,
              timezone: config.timezone,
            }}
            onBack={() => setStep('times')}
            onSuccess={() => setStep('sent')}
          />
        </div>
      )}

      {step === 'sent' && (
        <div className="tw:flex tw:flex-col tw:items-center tw:text-center tw:gap-4 tw:py-2">
          <div className="tw:flex tw:items-center tw:justify-center tw:w-12 tw:h-12 tw:rounded-full tw:bg-success">
            <CheckIcon className="tw:w-5 tw:h-5 tw:text-success" />
          </div>
          <p className="tw:text-sm tw:text-muted-dark">{config.get_text('req_sent_desc')}</p>
          <div className="tw:w-full tw:max-w-md tw:text-left tw:bg-content tw:border tw:border-default tw:rounded-lg tw:p-4">
            <SummaryList rows={rows} />
          </div>
          <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-2">
            <Button variant={onExit ? 'secondary' : 'primary'} onClick={reset}>
              {config.get_text('req_another')}
            </Button>
            {onExit && <Button onClick={onExit}>{config.get_text('req_back_to_booking')}</Button>}
          </div>
        </div>
      )}
    </FlowLayout>
  )
}
