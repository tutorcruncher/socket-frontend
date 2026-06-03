import Select, { type StylesConfig } from 'react-select'
import { useConfig } from '@/config/context'
import type { Subject } from '@/api/types'
import { SearchIcon, CrossIcon } from '@/components/ui/Icons'

// Tailwind tokens (resolved to hex) for react-select's emotion styling.
const C = {
  border: '#e5e7eb',
  link: '#2563eb',
  primary: '#1f374e',
  muted: '#94a3b8',
  hover: '#f1f5f9',
}

const selectStyles: StylesConfig<Subject, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 8,
    borderColor: state.isFocused ? C.link : C.border,
    boxShadow: state.isFocused ? `0 0 0 1px ${C.link}` : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    fontSize: 14,
    ':hover': { borderColor: state.isFocused ? C.link : C.border },
  }),
  placeholder: (base) => ({ ...base, color: C.muted }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    color: C.primary,
    backgroundColor: state.isFocused ? C.hover : 'white',
    ':active': { backgroundColor: C.hover },
  }),
  menu: (base) => ({ ...base, borderRadius: 8, overflow: 'hidden', zIndex: 20 }),
}

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
  if (!config.show_subject_filter) return null
  return (
    <div className="tw:flex-1 tw:min-w-[200px]">
      <Select<Subject, false>
        value={value}
        onChange={(s) => onChange(s)}
        options={subjects}
        placeholder={config.get_text('subject_filter_placeholder')}
        getOptionLabel={(s) => s.name}
        getOptionValue={(s) => String(s.id)}
        isClearable
        styles={selectStyles}
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
        className="tw:w-full tw:pl-9 tw:pr-9 tw:py-2 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:placeholder:text-muted tw:focus:outline-2 tw:focus:outline-link"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear location"
          onClick={() => {
            onChange(null)
            onSubmit(null)
          }}
          className="tw:absolute tw:right-2 tw:top-1/2 tw:-translate-y-1/2 tw:p-1 tw:rounded tw:text-muted-dark tw:hover:bg-hover"
        >
          <CrossIcon className="tw:w-3 tw:h-3" />
        </button>
      )}
    </div>
  )
}
