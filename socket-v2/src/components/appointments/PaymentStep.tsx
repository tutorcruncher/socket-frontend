import { useState } from 'react'
import { useConfig } from '@/config/context'
import type { SavedCard } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { LockIcon } from '@/components/ui/Icons'
import { cx } from '@/lib/utils'
import { FIELD_BASE, FIELD_BORDER, FIELD_LABEL } from '@/components/ui/fieldStyles'

export interface PaymentDetails {
  /** Existing saved payment method, when the client chose one. */
  saved_card_id?: string
  /** Raw card fields: only used by the mock; real Stripe Elements never exposes these. */
  card_number?: string
  card_expiry?: string
  card_cvc?: string
  card_name?: string
  save_card?: boolean
}

const INPUT = cx(FIELD_BASE, FIELD_BORDER, 'tw:w-full')

/** Card fields are numeric: a monospaced face stops the digits jittering as you type. */
const INPUT_NUM = `${INPUT} tw:font-mono tw:tracking-wide`

const LABEL = FIELD_LABEL

/**
 * Collects payment for a booking.
 *
 * **Production intent:** when `config.payment.publishable_key` is set, this should mount
 * Stripe Elements so card data never touches our bundle (PCI scope stays minimal).
 * `@stripe/react-stripe-js` is lazy-loaded so tenants that don't take payment don't pay
 * the bundle cost. Until the backend issues PaymentIntents, we render a *simulated*
 * card form and clearly label it, so nobody mistakes this for a live payment surface.
 */
export function PaymentStep({
  amount,
  savedCards,
  submitting,
  error,
  onBack,
  onPay,
}: {
  amount: number
  savedCards: SavedCard[]
  submitting: boolean
  error: string | null
  onBack: () => void
  onPay: (details: PaymentDetails) => void
}) {
  const config = useConfig()
  const uid = config.random_id
  const hasStripe = !!config.payment?.publishable_key

  const [useSaved, setUseSaved] = useState(savedCards.length > 0)
  const [savedId, setSavedId] = useState(savedCards[0]?.id ?? '')
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [saveCard, setSaveCard] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (useSaved) {
      onPay({ saved_card_id: savedId })
      return
    }
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 13 || !/^\d+$/.test(digits)) {
      setLocalError('Please enter a valid card number')
      return
    }
    if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(card.expiry)) {
      setLocalError('Please enter a valid expiry date (MM/YY)')
      return
    }
    if (!/^\d{3,4}$/.test(card.cvc)) {
      setLocalError('Please enter a valid CVC')
      return
    }
    onPay({
      card_number: digits,
      card_expiry: card.expiry,
      card_cvc: card.cvc,
      card_name: card.name,
      save_card: saveCard,
    })
  }

  return (
    <form onSubmit={submit} className="tw:flex tw:flex-col tw:gap-4">
      <div className="tw:flex tw:flex-col tw:gap-1">
        <h3 className="tw:text-base tw:font-medium tw:font-heading">
          {config.get_text('apt_card_details')}
        </h3>
        <span className="tw:flex tw:items-start tw:gap-1.5 tw:text-xs tw:text-muted-dark">
          <LockIcon className="tw:w-3 tw:h-3 tw:mt-0.5 tw:shrink-0" />
          <span>{config.get_text('apt_payment_secure')}</span>
        </span>
      </div>

      {!hasStripe && (
        <Alert variant="warning">
          <span>
            Demo mode: this is a simulated card form and no payment is taken. Use{' '}
            <code className="tw:font-mono tw:whitespace-nowrap">4000 0000 0000 0002</code> to test a
            declined card.
          </span>
        </Alert>
      )}

      {(error || localError) && <Alert variant="danger">{error ?? localError}</Alert>}

      {savedCards.length > 0 && (
        <div className="tw:flex tw:flex-col tw:gap-2">
          {savedCards.map((c) => (
            <label
              key={c.id}
              className={cx(
                'tw:flex tw:items-center tw:gap-2.5 tw:px-3 tw:py-2.5 tw:border tw:rounded-lg tw:cursor-pointer tw:transition-colors',
                useSaved && savedId === c.id
                  ? 'tw:border-link tw:bg-info'
                  : 'tw:border-default tw:hover:border-muted',
              )}
            >
              <input
                type="radio"
                name={`tcs-${uid}-card`}
                checked={useSaved && savedId === c.id}
                onChange={() => {
                  setUseSaved(true)
                  setSavedId(c.id)
                }}
              />
              <span className="tw:text-sm">
                {config.get_text('apt_saved_card_label', { brand: c.brand, last4: c.last4 })}
                <span className="tw:text-muted-dark">
                  {' '}
                  · {String(c.exp_month).padStart(2, '0')}/{String(c.exp_year).slice(-2)}
                </span>
              </span>
            </label>
          ))}
          <label
            className={cx(
              'tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:border tw:rounded-lg tw:cursor-pointer',
              !useSaved ? 'tw:border-link tw:bg-info' : 'tw:border-default tw:hover:border-muted',
            )}
          >
            <input
              type="radio"
              name={`tcs-${uid}-card`}
              checked={!useSaved}
              onChange={() => setUseSaved(false)}
            />
            <span className="tw:text-sm">{config.get_text('apt_use_new_card')}</span>
          </label>
        </div>
      )}

      {!useSaved && (
        <div className="tw:flex tw:flex-col tw:gap-3">
          <div className="tw:flex tw:flex-col tw:gap-1.5">
            <label htmlFor={`tcs-${uid}-cn`} className={LABEL}>
              {config.get_text('apt_card_number')}
            </label>
            <input
              id={`tcs-${uid}-cn`}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              className={INPUT_NUM}
            />
          </div>
          <div className="tw:grid tw:grid-cols-2 tw:gap-3">
            <div className="tw:flex tw:flex-col tw:gap-1.5">
              <label htmlFor={`tcs-${uid}-ce`} className={LABEL}>
                {config.get_text('apt_card_expiry')}
              </label>
              <input
                id={`tcs-${uid}-ce`}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                className={INPUT_NUM}
              />
            </div>
            <div className="tw:flex tw:flex-col tw:gap-1.5">
              <label htmlFor={`tcs-${uid}-cc`} className={LABEL}>
                {config.get_text('apt_card_cvc')}
              </label>
              <input
                id={`tcs-${uid}-cc`}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                className={INPUT_NUM}
              />
            </div>
          </div>
          <div className="tw:flex tw:flex-col tw:gap-1.5">
            <label htmlFor={`tcs-${uid}-cnm`} className={LABEL}>
              {config.get_text('apt_card_name')}
            </label>
            <input
              id={`tcs-${uid}-cnm`}
              autoComplete="cc-name"
              placeholder="As shown on the card"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              className={INPUT}
            />
          </div>
          <label className="tw:flex tw:items-center tw:gap-2.5 tw:text-sm tw:cursor-pointer tw:select-none">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
            />
            {config.get_text('apt_save_card')}
          </label>
        </div>
      )}

      <div className="tw:flex tw:gap-2 tw:pt-2 tw:border-t tw:border-default">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={submitting}
          className="tw:py-2.5"
        >
          {config.get_text('apt_back')}
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          icon={<LockIcon className="tw:w-3 tw:h-3" />}
          className="tw:flex-1 tw:py-2.5"
        >
          {config.get_text('apt_pay_now', { amount: config.format_money(amount) })}
        </Button>
      </div>
    </form>
  )
}
