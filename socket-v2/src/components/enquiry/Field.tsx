import { useConfig } from '@/config/context'
import type { EnquiryField } from '@/api/types'
import { cx } from '@/lib/utils'
import { FIELD_BASE, FIELD_BORDER } from '@/components/ui/fieldStyles'

// The checkout's field styling, so enquiry inputs match it and pick up themes.
const INPUT_CLASS = `tw:w-full ${FIELD_BASE} ${FIELD_BORDER}`

export interface FieldProps {
  field: EnquiryField
  value: unknown
  error?: string
  onChange: (value: unknown) => void
}

/** Renders one enquiry form field based on its API-declared type. */
export function Field({ field, value, error, onChange }: FieldProps) {
  const config = useConfig()
  const id = `tcs-${config.random_id}-${field.prefix ? field.prefix + '-' : ''}${field.field}`
  const requiredSuffix = field.required ? config.get_text('required') : ''

  if (field.type === 'checkbox') {
    return (
      <div className="tw:flex tw:items-start tw:gap-2">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="tw:mt-1"
        />
        <label htmlFor={id} className="tw:text-sm">
          {field.label}
          {requiredSuffix}
        </label>
      </div>
    )
  }

  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <label htmlFor={id} className="tw:text-sm tw:font-medium">
        {field.label}
        {requiredSuffix}
      </label>
      <FieldControl id={id} field={field} value={value} error={error} onChange={onChange} />
      {field.help_text && <div className="tw:text-xs tw:text-muted-dark">{field.help_text}</div>}
      {error && <div className="tw:text-xs tw:text-error">{error}</div>}
    </div>
  )
}

function FieldControl({ id, field, value, error, onChange }: FieldProps & { id: string }) {
  const cls = cx(INPUT_CLASS, error && 'tw:border-error')
  const v = (value ?? '') as string

  switch (field.type) {
    case 'select':
      return (
        <select id={id} value={v} onChange={(e) => onChange(e.target.value)} className={cls}>
          <option value="" />
          {field.choices?.map((c) => (
            <option key={c.value} value={c.value}>
              {c.display_name}
            </option>
          ))}
        </select>
      )
    case 'datetime':
      return (
        <div className="tw:flex tw:gap-2">
          <input
            id={id}
            type="date"
            value={v.split('T')[0] || ''}
            onChange={(e) => onChange(`${e.target.value}T${v.split('T')[1] || '00:00'}`)}
            className={cls}
          />
          <input
            type="time"
            value={v.split('T')[1] || ''}
            onChange={(e) => onChange(`${v.split('T')[0] || ''}T${e.target.value}`)}
            className={cls}
          />
        </div>
      )
    case 'date':
      return <input id={id} type="date" value={v} onChange={(e) => onChange(e.target.value)} className={cls} />
    case 'integer':
      return (
        <input
          id={id}
          type="number"
          step={1}
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )
    case 'email':
      return <input id={id} type="email" value={v} onChange={(e) => onChange(e.target.value)} className={cls} />
    default: {
      // Long max_length -> textarea, matching the legacy heuristic.
      const isLong = (field.max_length ?? 0) > 500
      return isLong ? (
        <textarea id={id} value={v} rows={4} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input
          id={id}
          type="text"
          maxLength={field.max_length}
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )
    }
  }
}
