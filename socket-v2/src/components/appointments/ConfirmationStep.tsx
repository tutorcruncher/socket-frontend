import { useConfig } from '@/config/context'
import type { Appointment, BookingConfirmation } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { CalendarPlusIcon, CheckIcon } from '@/components/ui/Icons'
import { downloadIcs } from '@/lib/ics'

/** Final step: confirmation, calendar invite and receipt. */
export function ConfirmationStep({
  apt,
  confirmation,
  dueLater = 0,
  email,
  onDone,
}: {
  apt: Appointment
  confirmation: BookingConfirmation
  /** Still to be invoiced after the lesson (pay later, or the rest after a deposit). */
  dueLater?: number
  /** Where the confirmation went, when we know it. */
  email: string | null
  onDone: () => void
}) {
  const config = useConfig()
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:text-center tw:gap-4 tw:py-2">
      <div className="tw:flex tw:items-center tw:justify-center tw:w-12 tw:h-12 tw:rounded-full tw:bg-success">
        <CheckIcon className="tw:w-5 tw:h-5 tw:text-success" />
      </div>

      {/* The step heading already says the lesson is booked. */}
      <div>
        <p className="tw:text-sm tw:text-muted-dark">
          {config.get_text('apt_confirmed_desc', {
            student_name: confirmation.student_name,
            service_name: apt.service_name,
          })}
        </p>
        <p className="tw:text-sm tw:text-muted-dark tw:mt-1">
          {config.format_dt(apt.start, 'full')}
        </p>
      </div>

      {confirmation.amount_paid > 0 && (
        <div className="tw:text-sm">
          <span className="tw:text-muted-dark">{config.get_text('apt_paid')}: </span>
          <span className="tw:font-semibold">{config.format_money(confirmation.amount_paid)}</span>
        </div>
      )}

      {dueLater > 0 && (
        <p className="tw:text-sm tw:font-medium">
          {config.get_text('apt_invoiced_later', { amount: config.format_money(dueLater) })}
        </p>
      )}

      <p className="tw:text-sm tw:text-muted-dark">
        {config.get_text(
          `apt_confirmed_email${confirmation.receipt_url ? '' : '_plain'}${email ? '_to' : ''}`,
          { email },
        )}
      </p>
      {confirmation.account_created && (
        <p className="tw:text-sm tw:text-muted-dark">{config.get_text('apt_account_created')}</p>
      )}

      <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-2 tw:w-full">
        <Button
          variant="secondary"
          onClick={() => downloadIcs(apt, config.name)}
          icon={<CalendarPlusIcon className="tw:w-3.5 tw:h-3.5" />}
        >
          {config.get_text('apt_add_to_calendar')}
        </Button>
        {confirmation.receipt_url && (
          <Button
            variant="secondary"
            onClick={() => window.open(confirmation.receipt_url, '_blank', 'noopener')}
          >
            {config.get_text('apt_view_receipt')}
          </Button>
        )}
        <Button onClick={onDone}>{config.get_text('apt_book_another')}</Button>
      </div>
    </div>
  )
}
