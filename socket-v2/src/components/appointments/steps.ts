import { useConfig } from '@/config/context'
import type { FlowStep } from '@/components/shared/FlowLayout'

/**
 * The booking flow's steps. Shared by the calendar and the routed checkout
 * (`#/appointment/:id`) so the stepper stays continuous across that boundary.
 * `includePayment` defaults to the tenant's payment setting; the checkout passes
 * the answer for the chosen lesson once it knows the amount.
 */
export function useBookingSteps(includePayment?: boolean): FlowStep[] {
  const config = useConfig()
  const withPayment = includePayment ?? !!config.payment?.required
  return [
    { id: 'time', label: config.get_text('apt_step_time') },
    { id: 'details', label: config.get_text('apt_step_details') },
    { id: 'review', label: config.get_text('apt_step_review') },
    ...(withPayment ? [{ id: 'payment', label: config.get_text('apt_step_payment') }] : []),
    { id: 'confirmed', label: config.get_text('apt_step_confirmed') },
  ]
}
