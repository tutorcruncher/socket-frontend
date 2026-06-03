import { useMemo, useState } from 'react'
import { useConfig, useApi } from '@/config/context'
import { useEnquiryForm } from '@/api/queries'
import { useEventCallback } from '@/lib/useEventCallback'
import type { ApiError } from '@/api/client'
import type { Contractor } from '@/api/types'
import { Field } from './Field'
import { Markdown } from '@/components/ui/Markdown'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { CenteredSpinner } from '@/components/ui/Spinner'

type FormValues = Record<string, unknown>

export type EnquiryMode = 'plain' | 'modal' | 'con-modal'

/** The dynamic, schema-driven enquiry form, shared across all enquiry entry points. */
export function EnquiryForm({
  mode,
  contractor,
}: {
  mode: EnquiryMode
  contractor?: Contractor
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

  if (isLoading || !formInfo) return <CenteredSpinner />

  const setValue = (key: string, prefix: string | undefined, value: unknown) => {
    setValues((prev) => {
      if (!prefix) return { ...prev, [key]: value }
      const group = { ...((prev[prefix] as FormValues) || {}), [key]: value }
      return { ...prev, [prefix]: group }
    })
  }

  const getValue = (key: string, prefix: string | undefined) =>
    prefix ? ((values[prefix] as FormValues)?.[key] ?? '') : (values[key] ?? '')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTopError(null)
    if (config.terms_link && !agreedTerms) {
      setTopError(config.get_text('terms_help') + ' ' + config.get_text('terms_link'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        contractor: contractor?.id,
        upstream_http_referrer: window.location.href,
      }
      await api.post('enquiry', payload, { expectedStatuses: [201] })
      emit('enquiry_submitted', { mode, data: payload })
      setSubmitted(true)
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

  const submitText = contractor
    ? config.get_text('contractor_enquiry_button', { contractor_name: contractor.name })
    : config.get_text('submit_enquiry')

  return (
    <form onSubmit={submit} className="tw:flex tw:flex-col tw:gap-4">
      <Markdown content={intro} className="tw:text-muted-dark" />
      {topError && <Alert variant="danger">{topError}</Alert>}

      <div className="tw:flex tw:flex-col tw:gap-4">
        {formInfo.visible.map((field) => (
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

      <Button type="submit" disabled={submitting}>
        {submitText}
      </Button>
    </form>
  )
}
