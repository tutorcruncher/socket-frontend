import { useState, type ReactNode } from 'react'
import { useConfig } from '@/config/context'
import { Button } from '@/components/ui/Button'
import { TermsCheckbox } from '@/components/shared/TermsCheckbox'

/**
 * Review + consent, shown before payment. Taking money without showing the
 * cancellation policy and getting explicit acceptance is a legal risk, so this step
 * gates the payment step rather than being optional. The order itself is summarised
 * in the flow's left-hand rail on wide screens; on phones the rail sits below the
 * step, so `summary` repeats it here where "check the details" can be acted on.
 */
export function ReviewStep({
  summary,
  submitLabel,
  note,
  submitting = false,
  onBack,
  onContinue,
}: {
  summary?: ReactNode
  /** Defaults to "Continue to payment"; the last step before booking says so instead. */
  submitLabel?: string
  /** What happens about payment when no payment step follows. */
  note?: string
  submitting?: boolean
  onBack: () => void
  onContinue: () => void
}) {
  const config = useConfig()
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const policy = config.payment?.cancellation_policy
  const policyUrl = config.payment?.cancellation_policy_url

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accepted) {
      setError(config.get_text('apt_must_accept_terms'))
      return
    }
    onContinue()
  }

  return (
    <form onSubmit={submit} className="tw:flex tw:flex-col tw:gap-4">
      {summary && (
        <div className="tw:lg:hidden tw:bg-content tw:border tw:border-default tw:rounded-lg tw:p-4">
          {summary}
        </div>
      )}

      {policy && (
        <div>
          <h3 className="tw:text-base tw:font-medium tw:font-heading tw:mb-1">
            {config.get_text('apt_cancellation_policy')}
          </h3>
          <p className="tw:text-sm tw:text-muted-dark">{policy}</p>
          {policyUrl && (
            <a
              href={policyUrl}
              target="_blank"
              rel="noreferrer"
              className="tw:inline-block tw:mt-1 tw:text-sm tw:underline"
            >
              {config.get_text('apt_cancellation_policy_link')}
            </a>
          )}
        </div>
      )}

      {note && <p className="tw:text-sm tw:font-medium">{note}</p>}

      <TermsCheckbox
        accepted={accepted}
        onChange={(v) => {
          setAccepted(v)
          if (v) setError(null)
        }}
        error={error}
      />

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
        <Button type="submit" disabled={submitting} className="tw:flex-1 tw:py-2.5">
          {submitLabel ?? config.get_text('apt_continue_to_payment')}
        </Button>
      </div>
    </form>
  )
}
