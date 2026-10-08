import type { ReactNode } from 'react'
import { cx } from '@/lib/utils'

/** UI2 basic_card container: white, bordered, rounded, subtle shadow. */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:relative tw:flex tw:flex-col tw:overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'tw:px-4 tw:py-3 tw:border-b tw:border-default tw:flex tw:items-center tw:justify-between',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('tw:p-4', className)}>{children}</div>
}
