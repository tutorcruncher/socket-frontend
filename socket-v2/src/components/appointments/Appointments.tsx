import { EmptyState } from '@/components/ui/EmptyState'
import { CalendarPlusIcon } from '@/components/ui/Icons'

/**
 * Appointments (browse + book) — placeholder.
 *
 * This section is intentionally stubbed for now: the Core + Contractors slice was
 * built first. The full implementation will port the legacy month/day grouped list,
 * SSO popup auth (sessionStorage `_tcs_user_data_`), and the booking modal against
 * `/{key}/appointments`, `/{key}/check-client` and `/{key}/book-appointment`.
 */
export function Appointments() {
  return (
    <div className="tcs-root tw:font-body tw:text-primary">
      <EmptyState
        title="Appointments coming soon"
        description="This section is being rebuilt. Browsing and booking lessons will be available here."
        icon={<CalendarPlusIcon className="tw:w-10 tw:h-10" />}
      />
    </div>
  )
}
