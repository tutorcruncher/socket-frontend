import { useConfig } from '@/config/context'
import type { PackageConfirmation } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/Icons'

/** Final step of a package purchase: the credit added, the receipt, and what next. */
export function PackageConfirmationStep({
  confirmation,
  email,
  onBuyAnother,
  onBookLesson,
}: {
  confirmation: PackageConfirmation
  /** Where the receipt went, when we know it. */
  email: string | null
  onBuyAnother: () => void
  onBookLesson: () => void
}) {
  const config = useConfig()
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:text-center tw:gap-4 tw:py-2">
      <div className="tw:flex tw:items-center tw:justify-center tw:w-12 tw:h-12 tw:rounded-full tw:bg-success">
        <CheckIcon className="tw:w-5 tw:h-5 tw:text-success" />
      </div>

      <p className="tw:text-sm tw:font-medium">
        {config.get_text('pkg_confirmed_desc', {
          amount: config.format_money(confirmation.credit_added),
        })}
      </p>

      <div className="tw:text-sm">
        <span className="tw:text-muted-dark">{config.get_text('apt_paid')}: </span>
        <span className="tw:font-semibold">{config.format_money(confirmation.amount_paid)}</span>
      </div>

      <p className="tw:text-sm tw:text-muted-dark">
        {config.get_text(`apt_confirmed_email${email ? '_to' : ''}`, { email })}
      </p>
      {confirmation.account_created && (
        <p className="tw:text-sm tw:text-muted-dark">{config.get_text('pkg_account_created')}</p>
      )}

      <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-2 tw:w-full">
        {confirmation.receipt_url && (
          <Button
            variant="secondary"
            onClick={() => window.open(confirmation.receipt_url, '_blank', 'noopener')}
          >
            {config.get_text('apt_view_receipt')}
          </Button>
        )}
        <Button variant="secondary" onClick={onBuyAnother}>
          {config.get_text('pkg_buy_another')}
        </Button>
        <Button onClick={onBookLesson}>{config.get_text('pkg_book_lesson')}</Button>
      </div>
    </div>
  )
}
