import { useConfig } from '@/config/context'
import type { DeliveryMode } from '@/api/types'
import { deliveryHelpKey, deliveryLabelKey } from '@/lib/delivery'
import { HomeIcon, LocationIcon, VideoIcon } from '@/components/ui/Icons'
import { cx } from '@/lib/utils'

export const MODE_ICONS = { online: VideoIcon, in_person: LocationIcon, home_visit: HomeIcon }

/**
 * Online / in person choice as a row of toggle cards. Pressing the chosen one
 * again clears it, so "no preference" needs no third option. `unavailable` modes
 * are shown but cannot be picked.
 */
export function DeliveryToggle({
  modes,
  value,
  onChange,
  unavailable = [],
}: {
  modes: DeliveryMode[]
  value: DeliveryMode | null
  onChange: (mode: DeliveryMode | null) => void
  unavailable?: DeliveryMode[]
}) {
  const config = useConfig()
  return (
    <>
      <div className={cx('tw:grid tw:gap-2', modes.length === 2 ? 'tw:grid-cols-2' : 'tw:grid-cols-3')}>
        {modes.map((mode) => {
          const Icon = MODE_ICONS[mode]
          const active = value === mode
          const off = unavailable.includes(mode)
          return (
            <button
              key={mode}
              type="button"
              aria-pressed={active}
              disabled={off}
              onClick={() => onChange(active ? null : mode)}
              className={cx(
                'tw:flex tw:flex-col tw:items-center tw:gap-1.5 tw:px-2 tw:py-3 tw:rounded-lg tw:border tw:text-center tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
                off
                  ? 'tw:border-default tw:bg-content tw:text-muted-dark tw:cursor-not-allowed'
                  : active
                    ? 'tw:border-link tw:bg-info tw:text-link tw:cursor-pointer'
                    : 'tw:border-default tw:bg-white tw:hover:bg-hover tw:cursor-pointer',
              )}
            >
              <Icon className="tw:w-4 tw:h-4" />
              <span className="tw:text-xs tw:font-medium tw:leading-tight">
                {config.get_text(deliveryLabelKey(mode))}
              </span>
              {off && (
                <span className="tw:text-xs tw:leading-tight">
                  {config.get_text('apt_mode_unavailable')}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {value && (
        <p className="tw:text-xs tw:text-muted-dark">{config.get_text(deliveryHelpKey(value))}</p>
      )}
    </>
  )
}
