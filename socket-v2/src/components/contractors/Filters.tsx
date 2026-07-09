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
    <div className="tw:flex-1 tw:min-w-[200px]">
      <Combobox
        items={items}
        value={selected}
        onChange={(item) => onChange(item ? (subjects.find((s) => s.id === item.id) ?? null) : null)}
        placeholder={config.get_text('subject_filter_placeholder')}
      />
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
    <div className="tw:flex-1 tw:min-w-[200px] tw:relative">
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
