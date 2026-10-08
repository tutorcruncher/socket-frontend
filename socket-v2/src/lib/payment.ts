import type { PaymentConfig } from '@/api/types'

export interface BookingCharge {
  /** Taken at booking. Zero when the tenant charges nothing up front. */
  dueNow: number
  /** Left to be invoiced after the lesson. */
  dueLater: number
}

/**
 * Splits a lesson's price into what is charged at booking and what is invoiced
 * afterwards. One place decides this, so the stepper, the amounts sent to the API
 * and the wording on review and confirmation cannot disagree:
 *   pay at booking -> all now;  deposit -> the deposit now (never more than the
 *   price), the rest later;  pay later -> nothing now;  free lesson -> nothing at all.
 */
export function bookingCharge(payment: PaymentConfig | undefined, price: number | null): BookingCharge {
  const total = price ?? 0
  let dueNow = 0
  if (payment?.required) {
    dueNow = payment.mode === 'deposit' ? Math.min(payment.deposit_amount ?? 0, total) : total
  }
  return { dueNow, dueLater: total - dueNow }
}
