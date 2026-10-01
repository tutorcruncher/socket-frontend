import { useMemo, useState } from 'react'
import { useConfig, useApi } from '@/config/context'
import { useEnquiryForm } from '@/api/queries'
import { useEventCallback } from '@/lib/useEventCallback'
import type { ApiError } from '@/api/client'
import type { Contractor, EnquiryField } from '@/api/types'
import { Field } from './Field'
import { Markdown } from '@/components/ui/Markdown'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { CenteredSpinner } from '@/components/ui/Spinner'

type FormValues = Record<string, unknown>

/** `subject` is the contact step of a lesson request: no intro, its own endpoint. */
export type EnquiryMode = 'plain' | 'modal' | 'con-modal' | 'subject'

const isEmpty = (v: unknown) => v === '' || v === undefined || v === null || v === false

/**
 * The dynamic, schema-driven enquiry form, shared across all enquiry entry points.
 *
 * The optional props let another flow reuse it as its contact step: `endpoint`
 * and `extra` change where and what is posted, `fieldFilter` narrows the tenant's
 * schema, `onBack` adds a Back button and `onSuccess` hands the result to the
 * caller instead of showing the built-in thank-you.
 */
export function EnquiryForm({
  mode,
  contractor,
  endpoint = 'enquiry',
  extra,
  fieldFilter,
  onBack,
  onSuccess,
}: {
  mode: EnquiryMode
  contractor?: Contractor
  endpoint?: string
  /** Merged into the posted payload. */
  extra?: Record<string, unknown>
  /** Keep the reference stable: it feeds a memo. */
  fieldFilter?: (field: EnquiryField) => boolean
  onBack?: () => void
  onSuccess?: () => void
}) {
  const config = useConfig()
  const api = useApi()
  const emit = useEventCallback()
  const { data: formInfo, isLoading } = useEnquiryForm()

  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [topError, setTopError] = useState<string | null>(null)
  const [agreedTerms, setAgreedTerms] = useState(false)

  const intro = useMemo(() => {
    if (contractor) {
      return config.get_text('contractor_enquiry', { contractor_name: contractor.name })
    }
    return config.get_text('enquiry')
  }, [config, contractor])

  const fields = useMemo(
    () =>
      (formInfo?.visible ?? [])
        .filter((f) => !fieldFilter || fieldFilter(f))
        // A lesson request is no use without a way to reply, whatever the schema says.
        .map((f) =>
          mode === 'subject' && f.field === 'client_email' && !f.prefix ? { ...f, required: true } : f,
        ),
    [formInfo, fieldFilter, mode],
  )

  if (isLoading || !formInfo) return <CenteredSpinner />

  const setValue = (key: string, prefix: string | undefined, value: unknown) => {
    setValues((prev) => {
      if (!prefix) return { ...prev, [key]: value }
      const group = { ...((prev[prefix] as FormValues) || {}), [key]: value }
      return { ...prev, [prefix]: group }
    })
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const getValue = (key: string, prefix: string | undefined) =>
    prefix ? ((values[prefix] as FormValues)?.[key] ?? '') : (values[key] ?? '')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTopError(null)
    // Catch missing required fields here, with every one marked, rather than
    // waiting for the server to reject the form.
    const missing: Record<string, string> = {}
    for (const f of fields) {
      if (f.required && isEmpty(getValue(f.field, f.prefix))) {
        missing[f.field] = config.get_text('apt_field_required')
      }
    }
    setErrors(missing)
    if (Object.keys(missing).length > 0) return
    if (config.terms_link && !agreedTerms) {
      setTopError(config.get_text('terms_help') + ' ' + config.get_text('terms_link'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        ...extra,
        contractor: contractor?.id,
        upstream_http_referrer: window.location.href,
      }
      await api.post(endpoint, payload, { expectedStatuses: [201] })
      emit('enquiry_submitted', { mode, data: payload })
      if (onSuccess) onSuccess()
      else setSubmitted(true)
    } catch (err) {
      const apiErr = err as ApiError
      // 400 responses carry per-field validation errors.
      if (apiErr.status === 400) {
        try {
          const parsed = JSON.parse(apiErr.msg.replace(/^.*Response: /, ''))
          const fieldErrors: Record<string, string> = {}
          for (const [k, v] of Object.entries(parsed)) {
            fieldErrors[k] = Array.isArray(v) ? String(v[0]) : String(v)
          }
          setErrors(fieldErrors)
        } catch {
          setTopError(apiErr.msg)
        }
      } else {
        setTopError(apiErr.msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    const key = mode === 'plain' ? 'enquiry_submitted_thanks' : 'enquiry_modal_submitted_thanks'
    return (
      <Alert variant="success">
        <span className="tw:whitespace-pre-line">{config.get_text(key)}</span>
      </Alert>
    )
  }

  const submitText =
    mode === 'subject'
      ? config.get_text('req_send')
      : contractor
        ? config.get_text('contractor_enquiry_button', { contractor_name: contractor.name })
        : config.get_text('submit_enquiry')

  return (
    // noValidate: required fields are checked above, with translatable messages.
    <form onSubmit={submit} noValidate className="tw:flex tw:flex-col tw:gap-4">
      {mode !== 'subject' && <Markdown content={intro} className="tw:text-muted-dark" />}
      {topError && <Alert variant="danger">{topError}</Alert>}

      <div className="tw:flex tw:flex-col tw:gap-4">
        {fields.map((field) => (
          <Field
            key={`${field.prefix ?? ''}.${field.field}`}
            field={field}
            value={getValue(field.field, field.prefix)}
            error={errors[field.field]}
            onChange={(v) => setValue(field.field, field.prefix, v)}
          />
        ))}
      </div>

      {config.terms_link && (
        <label className="tw:flex tw:items-start tw:gap-2 tw:text-sm">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="tw:mt-1"
          />
          <span>
            {config.get_text('terms_help')}{' '}
            <a href={config.terms_link} target="_blank" rel="noreferrer" className="tw:underline">
              {config.get_text('terms_link')}
            </a>
          </span>
        </label>
      )}

      {onBack ? (
        <div className="tw:flex tw:gap-2 tw:pt-2 tw:border-t tw:border-default">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={submitting}
            className="tw:py-2.5"
          >
            {config.get_text('apt_back')}
          </Button>
          <Button type="submit" disabled={submitting} className="tw:flex-1 tw:py-2.5">
            {submitText}
          </Button>
        </div>
      ) : (
        <Button type="submit" disabled={submitting}>
          {submitText}
        </Button>
      )}
    </form>
  )
}
