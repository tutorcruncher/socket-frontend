import { useConfig } from '@/config/context'
import { Button } from '@/components/ui/Button'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'

export function Pagination({
  page,
  hasMore,
  onChange,
}: {
  page: number
  hasMore: boolean
  onChange: (page: number) => void
}) {
  const config = useConfig()
  if (page <= 1 && !hasMore) return null
  return (
    <div className="tw:flex tw:items-center tw:justify-between tw:mt-4">
      <Button
        variant="secondary"
        size="small"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        icon={<ChevronLeftIcon className="tw:w-3 tw:h-3" />}
      >
        {config.get_text('previous')}
      </Button>
      <Button
        variant="secondary"
        size="small"
        disabled={!hasMore}
        onClick={() => onChange(page + 1)}
      >
        {config.get_text('next')}
        <ChevronRightIcon className="tw:w-3 tw:h-3" />
      </Button>
    </div>
  )
}
