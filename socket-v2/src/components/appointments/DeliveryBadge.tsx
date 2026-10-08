import { useConfig } from '@/config/context'
import type { DeliveryMode } from '@/api/types'
import { cx } from '@/lib/utils'
import { deliveryLabelKey } from '@/lib/delivery'
import { HomeIcon, LocationIcon, VideoIcon } from '@/components/ui/Icons'

const ICONS: Record<DeliveryMode, typeof LocationIcon> = {
  online: VideoIcon,
  in_person: LocationIcon,
  home_visit: HomeIcon,
}

const STYLES: Record<DeliveryMode, string> = {
  online: 'tw:bg-info tw:text-info',
  in_person: 'tw:bg-hover tw:text-muted-dark',
  home_visit: 'tw:bg-success tw:text-success',
}

/** Compact pill showing how a lesson is delivered. */
export function DeliveryBadge({
  mode,
  className,
}: {
  mode: DeliveryMode
  className?: string
}) {
  const config = useConfig()
  const Icon = ICONS[mode]
  return (
    <span
      className={cx(
        'tw:inline-flex tw:items-center tw:gap-1 tw:rounded-full tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:shrink-0',
        STYLES[mode],
        className,
      )}
    >
      <Icon className="tw:w-3 tw:h-3" />
      {config.get_text(deliveryLabelKey(mode))}
    </span>
  )
}
