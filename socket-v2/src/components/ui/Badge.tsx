import type { CSSProperties, ReactNode } from 'react'
import { cx } from '@/lib/utils'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'tw:bg-success tw:text-success',
  warning: 'tw:bg-warning tw:text-warning',
  danger: 'tw:bg-error tw:text-error',
  info: 'tw:bg-info tw:text-link',
  default: 'tw:bg-hover tw:text-muted-dark',
}

const BASE =
  'tcs-badge tw:inline-flex tw:items-center tw:rounded-full tw:px-2.5 tw:py-0.5 tw:text-xs tw:font-medium'

export function Badge({
  children,
  variant = 'default',
  className,
  style,
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  style?: CSSProperties
}) {
  return (
    <span className={cx(BASE, VARIANTS[variant], className)} style={style}>
      {children}
    </span>
  )
}
