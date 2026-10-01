import { useConfig } from '@/config/context'
import { cx } from '@/lib/utils'

export interface SummaryRow {
  label: string
  value: string
  /** Renders a "Change" link after the value. */
  onChange?: () => void
}

/**
 * Label/value summary of what is being bought or booked, with an optional
 * emphasised last line. Used by each flow's rail and its on-phone summaries.
 */
export function SummaryList({
  rows,
  total,
  className,
}: {
  rows: SummaryRow[]
  total?: { label: string; value: string } | null
  className?: string
}) {
  const config = useConfig()
  return (
    <dl className={cx('tw:flex tw:flex-col tw:gap-2 tw:text-sm', className)}>
      {rows.map((r) => (
        <div key={r.label} className="tw:flex tw:justify-between tw:gap-3">
          <dt className="tw:text-muted-dark tw:shrink-0">{r.label}</dt>
          <dd className="tw:text-right tw:min-w-0">
            {r.value}
            {r.onChange && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={r.onChange}
                  className="tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
                >
                  {config.get_text('apt_change_search')}
                </button>
              </>
            )}
          </dd>
        </div>
      ))}
      {total && (
        <div className="tw:flex tw:justify-between tw:gap-3 tw:pt-2 tw:border-t tw:border-default">
          <dt className="tw:font-medium">{total.label}</dt>
          <dd className="tw:font-semibold">{total.value}</dd>
        </div>
      )}
    </dl>
  )
}
