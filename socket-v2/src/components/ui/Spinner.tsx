import { cx } from '@/lib/utils'

/** An accessible loading spinner using the UI2 link colour. */
export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <svg
      className={cx('tw:animate-spin tw:text-link', className ?? 'tw:w-6 tw:h-6')}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle className="tw:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="tw:opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function CenteredSpinner({ message }: { message?: string }) {
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-3 tw:py-12">
      <Spinner className="tw:w-8 tw:h-8" />
      {message && <div className="tw:text-sm tw:text-muted-dark">{message}</div>}
    </div>
  )
}
