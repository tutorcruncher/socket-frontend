import { useConfig } from '@/config/context'
import type { AppointmentAuth } from '@/lib/useAppointmentAuth'
import { cx } from '@/lib/utils'

const LINK =
  'tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link'

/**
 * Sign-in, offered but never required. Browsing lessons needs no account; an
 * existing client can sign in from here to get their students, saved card and
 * "already attending" markers, and everyone else books as a guest.
 */
export function AccountLine({ auth, className }: { auth: AppointmentAuth; className?: string }) {
  const config = useConfig()
  return (
    <div
      className={cx(
        'tw:flex tw:flex-wrap tw:items-center tw:gap-x-1.5 tw:text-sm tw:text-muted-dark',
        className,
      )}
    >
      {auth.session ? (
        <>
          <span>{config.get_text('apt_signed_in_as', { name: auth.session.nm })}</span>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={auth.signout} className={LINK}>
            {config.get_text('apt_sign_out')}
          </button>
        </>
      ) : (
        <>
          <span>{config.get_text('apt_already_client')}</span>
          <button type="button" onClick={auth.signin} className={LINK}>
            {config.get_text('apt_sign_in_instead')}
          </button>
        </>
      )}
    </div>
  )
}
