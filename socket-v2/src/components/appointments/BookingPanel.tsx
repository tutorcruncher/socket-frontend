import { useMemo, useRef, useState } from 'react'
import { useApi, useConfig } from '@/config/context'
import { useEventCallback } from '@/lib/useEventCallback'
import type {
  Appointment,
  BookingConfirmation,
  BookingIntent,
  SavedCard,
} from '@/api/types'
import type { AppointmentAuth } from '@/lib/useAppointmentAuth'
import type { ApiError } from '@/api/client'
import { recordMockBooking } from '@/api/mock'
import { useServices } from '@/api/queries'
import { Alert } from '@/components/ui/Alert'
import { ChevronLeftIcon } from '@/components/ui/Icons'
import { FlowLayout } from './FlowLayout'
import { SummaryRail } from './SummaryRail'
import { GuestBookingForm, type GuestDetails } from './GuestBookingForm'
import { ReviewStep } from './ReviewStep'
import { PaymentStep, type PaymentDetails } from './PaymentStep'
import { ConfirmationStep } from './ConfirmationStep'
import { SignedInStudentPicker } from './SignedInStudentPicker'

type Step = 'details' | 'review' | 'payment' | 'confirmed'

/**
 * Booking checkout. Everything happens inline on the host page:
 *
 *   details  → who is booking (guest account creation, or a signed-in client's student)
 *   review   → summary + cancellation policy + terms acceptance
 *   payment  → card details (skipped entirely when the tenant doesn't take payment)
 *   confirmed→ receipt + calendar invite
 *
 * Payment is pay-to-confirm: the seat is reserved by `booking-intent` and only
 * becomes a real booking once `booking-confirm` succeeds (ROADMAP §3.5).
 */
export function BookingPanel({
  apt,
  auth,
  onBack,
}: {
  apt: Appointment
  auth: AppointmentAuth
  onBack: () => void
}) {
  const config = useConfig()
  const api = useApi()
  const emit = useEventCallback()
  const { data: services = [] } = useServices()
  const service = services.find((s) => s.id === apt.service_id) ?? null

  const paymentRequired = !!config.payment?.required
  const amount =
    config.payment?.mode === 'deposit'
      ? (config.payment.deposit_amount ?? 0)
      : (apt.price ?? 0)

  const [step, setStep] = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const intentRef = useRef<BookingIntent | null>(null)
  const guestRef = useRef<GuestDetails | null>(null)
  const studentIdRef = useRef<number | null>(null)

  const spacesAvailable =
    apt.attendees_max === null ? null : apt.attendees_max - apt.attendees_count

  const attendeeIds = useMemo(
    () => new Set<number>(auth.attendees?.[apt.id] ?? []),
    [apt.id, auth.attendees],
  )

  /** Reserve the seat + open a PaymentIntent, then move to review. */
  const startBooking = async (opts: {
    guest?: GuestDetails
    studentId?: number
    studentName: string
  }) => {
    setSubmitting(true)
    setError(null)
    guestRef.current = opts.guest ?? null
    studentIdRef.current = opts.studentId ?? null
    setStudentName(opts.studentName)

    try {
      const { data } = await api.post<BookingIntent>('booking-intent', {
        appointment: apt.id,
        amount,
        student_name: opts.studentName,
        student_id: opts.studentId,
        ...(opts.guest
          ? {
              client_name: opts.guest.client_name,
              client_email: opts.guest.client_email,
              client_phone: opts.guest.client_phone || undefined,
            }
          : {}),
        ...(auth.ssoArgs ?? {}),
      })
      intentRef.current = data
      setSavedCards(data.saved_cards ?? [])
      setStep('review')
    } catch (e) {
      setError((e as ApiError).msg || 'We could not hold this place. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /** Confirm the booking: with payment when required, without when not. */
  const confirmBooking = async (payment?: PaymentDetails) => {
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await api.post<BookingConfirmation>('booking-confirm', {
        booking_id: intentRef.current?.booking_id,
        appointment: apt.id,
        amount,
        student_name: studentName,
        student_id: studentIdRef.current ?? undefined,
        client_email: guestRef.current?.client_email,
        ...(payment ?? {}),
      })
      setConfirmation(data)
      setStep('confirmed')
      emit('booked_appointment', {
        appointment: apt.id,
        student: studentName,
        amount_paid: data.amount_paid,
        new_account: !!data.account_created,
      })
      // Keep "my bookings" in sync while the backend endpoint is mocked.
      recordMockBooking({
        booking_id: data.booking_id,
        appointment: apt.id,
        service_name: apt.service_name,
        service_colour: apt.service_colour,
        student_name: studentName,
        start: apt.start,
        finish: apt.finish,
        delivery: apt.delivery,
        address: apt.address,
        price: apt.price,
        can_cancel: true,
      })
      void auth.refreshAttendees()
    } catch (e) {
      const err = e as ApiError
      setError(err.msg || 'Payment could not be completed. Please try again.')
      // Stay on the payment step so the card can be corrected.
    } finally {
      setSubmitting(false)
    }
  }

  const intros: Partial<Record<Step, string>> = {
    details: config.get_text('apt_step_details_intro'),
    review: config.get_text('apt_step_review_intro'),
    payment: config.get_text('apt_step_payment_intro'),
  }
  const summaryStarted = step !== 'details'

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {step !== 'confirmed' && (
        <button
          type="button"
          onClick={onBack}
          className="tw:self-start tw:inline-flex tw:items-center tw:gap-1.5 tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          <ChevronLeftIcon className="tw:w-3 tw:h-3" />
          {config.get_text('apt_back_to_calendar')}
        </button>
      )}

      <FlowLayout
        stepId={step}
        intro={intros[step]}
        includePayment={paymentRequired && amount > 0}
        rail={
          <SummaryRail
            service={service}
            apt={apt}
            studentName={summaryStarted ? studentName : null}
            amount={amount}
            showTotal={summaryStarted}
          />
        }
      >
        {error && step !== 'payment' && <Alert variant="danger">{error}</Alert>}

        {step === 'details' &&
          (auth.session ? (
            <SignedInStudentPicker
              auth={auth}
              attendeeIds={attendeeIds}
              submitting={submitting}
              disabled={spacesAvailable === 0}
              onChoose={(id, name) => startBooking({ studentId: id, studentName: name })}
            />
          ) : (
            <GuestBookingForm
              submitting={submitting}
              onSubmit={(d) => startBooking({ guest: d, studentName: d.student_name })}
              onUseSignIn={auth.signin}
            />
          ))}

        {step === 'review' && (
          <ReviewStep
            onBack={() => setStep('details')}
            onContinue={() => {
              if (paymentRequired && amount > 0) setStep('payment')
              else void confirmBooking()
            }}
          />
        )}

        {step === 'payment' && (
          <>
            <Alert variant="info">{config.get_text('apt_seat_held')}</Alert>
            <PaymentStep
              amount={amount}
              savedCards={savedCards}
              submitting={submitting}
              error={error}
              onBack={() => {
                setError(null)
                setStep('review')
              }}
              onPay={(details) => void confirmBooking(details)}
            />
          </>
        )}

        {step === 'confirmed' && confirmation && (
          <ConfirmationStep apt={apt} confirmation={confirmation} onDone={onBack} />
        )}
      </FlowLayout>
    </div>
  )
}
