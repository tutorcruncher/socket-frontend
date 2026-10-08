import type { ReactNode } from 'react'
import { cx } from '@/lib/utils'

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info'

const VARIANTS: Record<AlertVariant, string> = {
  success: 'tw:bg-success tw:border-success tw:text-success',
  warning: 'tw:bg-warning tw:border-warning tw:text-warning',
  danger: 'tw:bg-error tw:border-error tw:text-error',
  info: 'tw:bg-info tw:border-info tw:text-info',
}

export function Alert({
  children,
  variant = 'info',
  className,
}: {
  children: ReactNode
  variant?: AlertVariant
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cx(
        'tw:border tw:rounded-lg tw:p-4 tw:flex tw:items-start tw:gap-2 tw:text-sm',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}
