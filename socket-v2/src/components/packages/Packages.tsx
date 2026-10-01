import { useRef, useState } from 'react'
import { useApi, useConfig } from '@/config/context'
import { usePackages } from '@/api/queries'
import { useEventCallback } from '@/lib/useEventCallback'
import { useAppointmentAuth } from '@/lib/useAppointmentAuth'
import type { ApiError } from '@/api/client'
import type { CreditPackage, PackageConfirmation, PackageIntent, SavedCard } from '@/api/types'
import { FlowLayout, type FlowStep } from '@/components/shared/FlowLayout'
import { SummaryList } from '@/components/shared/SummaryList'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Markdown } from '@/components/ui/Markdown'
import { CenteredSpinner } from '@/components/ui/Spinner'
import { AccountLine } from '@/components/appointments/AccountLine'
import { GuestBookingForm, type GuestDetails } from '@/components/appointments/GuestBookingForm'
import { PaymentStep, type PaymentDetails } from '@/components/appointments/PaymentStep'
import { PackageCards, PackageTile } from './PackageCards'
import { PackageConfirmationStep } from './PackageConfirmation'

type Step = 'package' | 'details' | 'payment' | 'confirmed'

/**
 * Packages: buy prepaid lesson credit.
 *
 *   package   → choose one of the tenant's packages
 *   details   → who is buying (a guest's account is created; a client just confirms)
 *   payment   → card, with the terms accepted here as there is no review step
 *   confirmed → credit added + receipt
 *
 * A package is a purchase, so it always takes payment, whatever the tenant's
 * setting for charging lessons at booking. `package-intent` opens the payment and
 * `package-confirm` completes it; both are mocked (ROADMAP §3.8).
 */
export function Packages() {
  const config = useConfig()
  const api = useApi()
  const emit = useEventCallback()
  const auth = useAppointmentAuth()
  const { data: packages = [], isPending, isError } = usePackages()

  const [step, setStep] = useState<Step>('package')
  const [chosen, setChosen] = useState<CreditPackage | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [confirmation, setConfirmation] = useState<PackageConfirmation | null>(null)
  const intentRef = useRef<PackageIntent | null>(null)
  const guestRef = useRef<GuestDetails | null>(null)

  const steps: FlowStep[] = [
    { id: 'package', label: config.get_text('pkg_step_package') },
    { id: 'details', label: config.get_text('apt_step_details') },
    { id: 'payment', label: config.get_text('apt_step_payment') },
    { id: 'confirmed', label: config.get_text('apt_step_confirmed') },
  ]

  /** Open the payment for the chosen package, then move to the card step. */
  const startPurchase = async (guest?: GuestDetails) => {
    if (!chosen) return
    setSubmitting(true)
    setError(null)
    guestRef.current = guest ?? null
    try {
      const { data } = await api.post<PackageIntent>('package-intent', {
        package: chosen.id,
        ...(guest
          ? {
              client_name: guest.client_name,
              client_email: guest.client_email,
              client_phone: guest.client_phone || undefined,
            }
          : {}),
        ...(auth.ssoArgs ?? {}),
      })
      intentRef.current = data
      setSavedCards(data.saved_cards ?? [])
      setStep('payment')
    } catch (e) {
      setError((e as ApiError).msg || 'We could not start this purchase. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmPurchase = async (payment: PaymentDetails) => {
    if (!chosen) return
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await api.post<PackageConfirmation>('package-confirm', {
        purchase_id: intentRef.current?.purchase_id,
        package: chosen.id,
        client_email: guestRef.current?.client_email,
        ...payment,
      })
      setConfirmation(data)
      setStep('confirmed')
      emit('package_purchased', {
        package: chosen.id,
        amount_paid: data.amount_paid,
        credit_added: data.credit_added,
        new_account: !!data.account_created,
      })
    } catch (e) {
      // Stay on the payment step so the card can be corrected.
      setError((e as ApiError).msg || 'Payment could not be completed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const backToPackages = () => {
    setError(null)
    setStep('package')
  }

  const titles: Partial<Record<Step, string>> = {
    package: config.get_text('pkg_title'),
    confirmed: config.get_text('pkg_confirmed_title'),
  }
  const intros: Partial<Record<Step, string>> = {
    package: config.get_text('pkg_intro'),
    details: config.get_text(auth.session ? 'pkg_details_signed_in' : 'pkg_details_intro'),
    payment: config.get_text('pkg_payment_intro'),
  }
  const inCheckout = step === 'details' || step === 'payment'

  return (
    <div className="tcs-root tw:font-body tw:text-primary tw:flex tw:flex-col tw:gap-4">
      {step !== 'confirmed' && <AccountLine auth={auth} className="tw:justify-end" />}

      <FlowLayout
        steps={steps}
        stepId={step}
        title={titles[step]}
        intro={intros[step]}
        back={inCheckout ? { label: config.get_text('pkg_back'), onClick: backToPackages } : undefined}
        rail={
          inCheckout && chosen ? (
            <div className="tw:flex tw:flex-col tw:gap-4">
              <div className="tw:flex tw:items-start tw:gap-3">
                <PackageTile pkg={chosen} />
                <div className="tw:min-w-0">
                  <h2 className="tw:text-xl tw:font-medium tw:font-heading">{chosen.name}</h2>
                  {chosen.description && (
                    <div className="tw:text-sm tw:text-muted-dark tw:mt-1.5">
                      <Markdown content={chosen.description} />
                    </div>
                  )}
                </div>
              </div>
              <SummaryList
                rows={[
                  {
                    label: config.get_text('pkg_summary_pay'),
                    value: config.format_money(chosen.cost),
                    onChange: backToPackages,
                  },
                  ...(chosen.bonus_credit > 0
                    ? [
                        {
                          label: config.get_text('pkg_summary_bonus'),
                          value: config.format_money(chosen.bonus_credit),
                        },
                      ]
                    : []),
                ]}
                total={{
                  label: config.get_text('pkg_summary_credit'),
                  value: config.format_money(chosen.cost + chosen.bonus_credit),
                }}
                className="tw:pt-3 tw:border-t tw:border-default"
              />
            </div>
          ) : undefined
        }
      >
        {error && step !== 'payment' && <Alert variant="danger">{error}</Alert>}

        {step === 'package' &&
          (isPending ? (
            <CenteredSpinner message={config.get_text('loading')} />
          ) : isError ? (
            <Alert variant="danger">Something went wrong loading packages. Please try again.</Alert>
          ) : packages.length === 0 ? (
            <EmptyState
              title={config.get_text('pkg_none')}
              description={config.get_text('pkg_none_desc')}
            />
          ) : (
            <PackageCards
              packages={packages}
              onChoose={(pkg) => {
                setChosen(pkg)
                setStep('details')
              }}
            />
          ))}

        {step === 'details' &&
          (auth.session ? (
            // A signed-in client has nothing to fill in: confirm whose account it is.
            <div className="tw:flex tw:flex-col tw:gap-4">
              <p className="tw:text-sm">
                {config.get_text('apt_signed_in_as', { name: auth.session.nm })}
              </p>
              <Button
                onClick={() => void startPurchase()}
                disabled={submitting}
                className="tw:py-2.5"
              >
                {config.get_text('apt_details_continue')}
              </Button>
            </div>
          ) : (
            <GuestBookingForm
              submitting={submitting}
              withStudent={false}
              onSubmit={(d) => void startPurchase(d)}
              onUseSignIn={auth.signin}
            />
          ))}

        {step === 'payment' && chosen && (
          <PaymentStep
            amount={intentRef.current?.amount ?? chosen.cost}
            savedCards={savedCards}
            submitting={submitting}
            error={error}
            submitLabel={config.get_text('pkg_pay', {
              amount: config.format_money(intentRef.current?.amount ?? chosen.cost),
            })}
            requireTerms
            onBack={() => {
              setError(null)
              setStep('details')
            }}
            onPay={(details) => void confirmPurchase(details)}
          />
        )}

        {step === 'confirmed' && confirmation && (
          <PackageConfirmationStep
            confirmation={confirmation}
            email={guestRef.current?.client_email ?? null}
            onBuyAnother={() => {
              setChosen(null)
              setConfirmation(null)
              setStep('package')
            }}
            onBookLesson={() => emit('package_book_lesson', { package: confirmation.package })}
          />
        )}
      </FlowLayout>
    </div>
  )
}
