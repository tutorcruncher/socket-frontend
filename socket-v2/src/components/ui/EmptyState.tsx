import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description?: string
  icon?: ReactNode
}) {
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-12 tw:px-4 tw:border-2 tw:bg-white tw:border-default tw:border-dashed tw:rounded-md">
      {icon && <div className="tw:mb-4 tw:text-muted tw:w-10 tw:h-10">{icon}</div>}
      <div className="tw:text-lg tw:font-semibold tw:font-heading tw:text-heading tw:mb-1 tw:text-center">
        {title}
      </div>
      {description && (
        <div className="tw:text-muted-dark tw:text-sm tw:text-center tw:max-w-md">{description}</div>
      )}
    </div>
  )
}
