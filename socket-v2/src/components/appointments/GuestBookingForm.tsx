import { useState } from 'react'
import { useConfig } from '@/config/context'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils'
import {
  FIELD_BASE,
  FIELD_BORDER,
  FIELD_BORDER_ERROR,
  FIELD_LABEL,
} from '@/components/ui/fieldStyles'

export interface GuestDetails {
  client_name: string
  client_email: string
  client_phone: string
  student_name: string
}

type Errors = Partial<Record<keyof GuestDetails, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Inline account creation: the parent books without leaving the host page.
 *
 * Collects the same fields the `/enquiry` endpoint already uses to create a client
 * and service recipient (student), so the backend work is a booking variant of an
 * existing flow rather than a new identity system. See ROADMAP §3.4.
 */
export function GuestBookingForm({
  submitting,
  onSubmit,
  onUseSignIn,
}: {
  submitting: boolean
  onSubmit: (details: GuestDetails) => void
  onUseSignIn: () => void
}) {
  const config = useConfig()
  const uid = config.random_id
  const [values, setValues] = useState<GuestDetails>({
    client_name: '',
    client_email: '',
    client_phone: '',
    student_name: '',
  })
  const [errors, setErrors] = useState<Errors>({})

  const set = (k: keyof GuestDetails, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (!values.client_name.trim()) next.client_name = config.get_text('apt_field_required')
    if (!values.client_email.trim()) next.client_email = config.get_text('apt_field_required')
    else if (!EMAIL_RE.test(values.client_email.trim()))
      next.client_email = config.get_text('apt_email_invalid')
    if (!values.student_name.trim()) next.student_name = config.get_text('apt_field_required')
    setErrors(next)
    if (Object.keys(next).length === 0) onSubmit(values)
  }

  return (
    // noValidate: this form does its own validation with translatable messages.
    // Without it the browser's native bubble fires first on type="email"/required,
    // blocking submit, so our styled, tenant-customisable errors never render and
    // only the first offending field is reported.
    <form onSubmit={submit} noValidate className="tw:flex tw:flex-col tw:gap-4">
      {/* The step heading comes from the flow shell; only the account note is ours. */}
      <p className="tw:text-sm tw:text-muted-dark">{config.get_text('apt_guest_intro')}</p>

      <Field
        id={`tcs-${uid}-gb-name`}
        label={config.get_text('apt_your_name')}
        value={values.client_name}
        onChange={(v) => set('client_name', v)}
        error={errors.client_name}
        autoComplete="name"
        required
      />
      <Field
        id={`tcs-${uid}-gb-email`}
        label={config.get_text('apt_your_email')}
        type="email"
        value={values.client_email}
        onChange={(v) => set('client_email', v)}
        error={errors.client_email}
        autoComplete="email"
        required
      />
      <Field
        id={`tcs-${uid}-gb-phone`}
        label={config.get_text('apt_your_phone')}
        type="tel"
        value={values.client_phone}
        onChange={(v) => set('client_phone', v)}
        error={errors.client_phone}
        autoComplete="tel"
      />
      <Field
        id={`tcs-${uid}-gb-student`}
        label={config.get_text('apt_student_name')}
        help={config.get_text('apt_student_help')}
        value={values.student_name}
        onChange={(v) => set('student_name', v)}
        error={errors.student_name}
        required
      />

      <Button type="submit" disabled={submitting} className="tw:py-2.5 tw:mt-1">
        {config.get_text('apt_confirm_booking')}
      </Button>

      <div className="tw:text-sm tw:text-muted-dark tw:text-center">
        {config.get_text('apt_have_account')}{' '}
        <button
          type="button"
          onClick={onUseSignIn}
          className="tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          {config.get_text('apt_sign_in_instead')}
        </button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  help,
  type = 'text',
  required,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  help?: string
  type?: string
  required?: boolean
  autoComplete?: string
}) {
  const config = useConfig()
  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
        {required && config.get_text('required')}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cx(FIELD_BASE, 'tw:w-full', error ? FIELD_BORDER_ERROR : FIELD_BORDER)}
      />
      {help && !error && <div className="tw:text-xs tw:text-muted-dark">{help}</div>}
      {error && (
        <div id={`${id}-err`} className="tw:text-xs tw:text-error">
          {error}
        </div>
      )}
    </div>
  )
}
