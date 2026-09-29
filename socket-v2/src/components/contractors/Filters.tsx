import { useMemo } from 'react'
import { useConfig } from '@/config/context'
import type { Subject } from '@/api/types'
import { SearchIcon, CrossIcon } from '@/components/ui/Icons'
import { Combobox, type ComboboxItem } from '@/components/ui/Combobox'

export function SubjectSelect({
  subjects,
  value,
  onChange,
}: {
  subjects: Subject[]
  value: Subject | null
  onChange: (s: Subject | null) => void
}) {
  const config = useConfig()
  const items = useMemo<ComboboxItem[]>(
    () => subjects.map((s) => ({ id: s.id, label: s.name })),
    [subjects],
  )
  if (!config.show_subject_filter) return null
  const selected = value ? { id: value.id, label: value.name } : null
  return (
    <div className="tw:flex-1 tw:min-w-[180px] tw:max-w-[260px]">
      <Combobox
        items={items}
        value={selected}
        onChange={(item) => onChange(item ? (subjects.find((s) => s.id === item.id) ?? null) : null)}
        placeholder={config.get_text('subject_filter_placeholder')}
      />
    </div>
  )
}

/**
 * A removable active-filter pill. Shows what is narrowing the results and gives a
 * one-click way out: otherwise a parent who filters to nothing has to work out
 * which control to reset.
 */
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const config = useConfig()
  return (
    <span className="tw:inline-flex tw:items-center tw:gap-1 tw:pl-2 tw:pr-1 tw:py-0.5 tw:text-xs tw:bg-info tw:text-info tw:rounded-full tw:max-w-full">
      <span className="tw:truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={config.get_text('filter_remove', { label })}
        className="tw:flex tw:items-center tw:justify-center tw:w-4 tw:h-4 tw:rounded-full tw:shrink-0 tw:hover:bg-white/60 tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
      >
        <CrossIcon className="tw:w-2 tw:h-2" />
      </button>
    </span>
  )
}

/**
 * Hourly-rate bounds: `min` inclusive, `max` exclusive, `null` meaning unbounded.
 * The half-open interval is what keeps adjacent bands from overlapping.
 */
export interface RateRange {
  min: number | null
  max: number | null
}

/** The bands a parent actually thinks in. Kept coarse: a slider is overkill here. */
const RATE_BANDS: RateRange[] = [
  { min: null, max: 40 },
  { min: 40, max: 60 },
  { min: 60, max: null },
]

const rateKey = (r: RateRange | null) => (r ? `${r.min ?? ''}-${r.max ?? ''}` : '')

/**
 * Online-only toggle and price band (ROADMAP §3.2): the two filters parents reach
 * for after subject and location. Hidden until the data exists: with no tutor
 * carrying `rate_from` or `remote`, these would filter everything to nothing.
 */
export function RateAndRemoteFilters({
  available,
  remote,
  rate,
  onRemoteChange,
  onRateChange,
}: {
  available: { rate: boolean; remote: boolean }
  remote: boolean
  rate: RateRange | null
  onRemoteChange: (v: boolean) => void
  onRateChange: (v: RateRange | null) => void
}) {
  const config = useConfig()
  if (!available.rate && !available.remote) return null

  const bandLabel = (b: RateRange) => {
    const money = (n: number) => config.format_money(n)
    if (b.min === null) return config.get_text('filter_rate_under', { amount: money(b.max!) })
    if (b.max === null) return config.get_text('filter_rate_over', { amount: money(b.min) })
    return config.get_text('filter_rate_between', { min: money(b.min), max: money(b.max) })
  }

  return (
    <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
      {available.remote && (
        <label className="tw:inline-flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:cursor-pointer tw:select-none tw:transition-colors tw:hover:border-muted">
          <input type="checkbox" checked={remote} onChange={(e) => onRemoteChange(e.target.checked)} />
          {config.get_text('filter_online_only')}
        </label>
      )}
      {available.rate && (
        <select
          aria-label={config.get_text('filter_price_label')}
          value={rateKey(rate)}
          onChange={(e) => {
            const found = RATE_BANDS.find((b) => rateKey(b) === e.target.value)
            onRateChange(found ?? null)
          }}
          className="tw:px-3 tw:py-2 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:cursor-pointer tw:transition-colors tw:hover:border-muted tw:focus:outline-2 tw:focus:outline-link"
        >
          <option value="">{config.get_text('filter_rate_any')}</option>
          {RATE_BANDS.map((b) => (
            <option key={rateKey(b)} value={rateKey(b)}>
              {bandLabel(b)}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export function LocationInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string | null
  onChange: (v: string | null) => void
  onSubmit: (v: string | null) => void
}) {
  const config = useConfig()
  if (!config.show_location_search) return null
  return (
    <div className="tw:flex-1 tw:min-w-[180px] tw:max-w-[260px] tw:relative">
      <SearchIcon className="tw:w-4 tw:h-4 tw:text-muted tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none" />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit(value)}
        placeholder={config.get_text('location_input_placeholder')}
        className="tw:w-full tw:pl-9 tw:pr-9 tw:py-2 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:placeholder:text-muted-dark tw:focus:outline-2 tw:focus:outline-link"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear location"
          onClick={() => {
            onChange(null)
            onSubmit(null)
          }}
          className="tw:absolute tw:right-1.5 tw:top-1/2 tw:-translate-y-1/2 tw:flex tw:items-center tw:justify-center tw:w-6 tw:h-6 tw:rounded tw:text-muted-dark tw:hover:bg-hover tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          <CrossIcon className="tw:w-3 tw:h-3" />
        </button>
      )}
    </div>
  )
}
