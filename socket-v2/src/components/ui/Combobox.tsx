import { useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '@/lib/utils'
import { CrossIcon, SearchIcon } from './Icons'

/** Rank matches: prefix > word-start > substring, so the best hit sorts first. */
function rank(label: string, q: string): number {
  const l = label.toLowerCase()
  if (!q) return 0
  if (l.startsWith(q)) return 0
  if (l.includes(' ' + q)) return 1
  if (l.includes(q)) return 2
  return -1
}

export interface ComboboxItem {
  id: number | string
  label: string
}

/**
 * Lightweight, accessible single-select combobox: replaces react-select (and its
 * Emotion dependency) to keep the embed bundle small. Supports type-to-filter,
 * keyboard navigation (↑/↓/Enter/Escape) and a clear button.
 */
export function Combobox<T extends ComboboxItem>({
  items,
  value,
  onChange,
  placeholder,
}: {
  items: T[]
  value: T | null
  onChange: (item: T | null) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useRef(`tcs-cb-${Math.random().toString(36).slice(2, 8)}`).current

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items
      .map((i) => ({ i, r: rank(i.label, q) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r)
      .map((x) => x.i)
  }, [items, query])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const select = (item: T | null) => {
    onChange(item)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[active]) {
        e.preventDefault()
        select(filtered[active])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const displayValue = open ? query : (value?.label ?? '')

  return (
    <div ref={rootRef} className="tw:relative">
      <div className="tw:relative">
        {open && (
          <SearchIcon className="tw:w-4 tw:h-4 tw:text-muted tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none" />
        )}
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={displayValue}
          placeholder={value && !open ? value.label : placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className={cx(
            'tw:w-full tw:pr-8 tw:py-2 tw:text-sm tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:placeholder:text-muted-dark tw:focus:outline-2 tw:focus:outline-link',
            open ? 'tw:pl-9' : 'tw:pl-3',
          )}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(e) => {
              e.preventDefault()
              select(null)
            }}
            className="tw:absolute tw:right-1.5 tw:top-1/2 tw:-translate-y-1/2 tw:flex tw:items-center tw:justify-center tw:w-6 tw:h-6 tw:rounded tw:text-muted-dark tw:hover:bg-hover tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
          >
            <CrossIcon className="tw:w-3 tw:h-3" />
          </button>
        ) : (
          <span className="tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-muted tw:pointer-events-none tw:text-xs">
            ▾
          </span>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="tw:absolute tw:z-20 tw:mt-1 tw:w-full tw:max-h-60 tw:overflow-auto tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-lg tw:py-1"
        >
          {filtered.length === 0 ? (
            <li className="tw:px-3 tw:py-2 tw:text-sm tw:text-muted-dark">No matches</li>
          ) : (
            filtered.map((item, i) => (
              <li
                key={item.id}
                role="option"
                aria-selected={value?.id === item.id}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(item)
                }}
                className={cx(
                  'tw:flex tw:items-center tw:justify-between tw:gap-2 tw:px-3 tw:py-1.5 tw:text-sm tw:cursor-pointer',
                  i === active ? 'tw:bg-hover' : 'tw:bg-white',
                  value?.id === item.id && 'tw:font-medium tw:text-link',
                )}
              >
                <span className="tw:truncate">{item.label}</span>
                {value?.id === item.id && <span className="tw:text-link tw:text-xs">✓</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
