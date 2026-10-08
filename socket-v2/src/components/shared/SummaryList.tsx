import { Fragment } from 'react'
import { useConfig } from '@/config/context'
import { cx } from '@/lib/utils'

export interface SummaryRow {
  label: string
  value: string
  /**
   * A breakdown shown under the label instead of `value`, for something too long
   * to sit on one line (a week of preferred times, say).
   */
  detail?: Array<{ label: string; value: string }>
  /** Renders a "Change" link for the row. */
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
  const change = (onChange: () => void) => (
    <button
      type="button"
      onClick={onChange}
      className="tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
    >
      {config.get_text('apt_change_search')}
    </button>
  )
  return (
    <dl className={cx('tw:flex tw:flex-col tw:gap-2 tw:text-sm', className)}>
      {rows.map((r) =>
        r.detail?.length ? (
          <div key={r.label} className="tw:flex tw:flex-col tw:gap-1">
            <div className="tw:flex tw:justify-between tw:gap-3">
              <dt className="tw:text-muted-dark">{r.label}</dt>
              {r.onChange && change(r.onChange)}
            </div>
            <dd className="tw:m-0 tw:grid tw:grid-cols-[auto_minmax(0,1fr)] tw:gap-x-3 tw:gap-y-0.5">
              {r.detail.map((d) => (
                <Fragment key={d.label}>
                  <span className="tw:font-medium">{d.label}</span>
                  <span className="tw:text-muted-dark">{d.value}</span>
                </Fragment>
              ))}
            </dd>
          </div>
        ) : (
          <div key={r.label} className="tw:flex tw:justify-between tw:gap-3">
            <dt className="tw:text-muted-dark tw:shrink-0">{r.label}</dt>
            <dd className="tw:m-0 tw:text-right tw:min-w-0">
              {r.value}
              {r.onChange && <> {change(r.onChange)}</>}
            </dd>
          </div>
        ),
      )}
      {total && (
        <div className="tw:flex tw:justify-between tw:gap-3 tw:pt-2 tw:border-t tw:border-default">
          <dt className="tw:font-medium">{total.label}</dt>
          <dd className="tw:m-0 tw:font-semibold">{total.value}</dd>
        </div>
      )}
    </dl>
  )
}
