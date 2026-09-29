import { useState } from 'react'
import { useApi, useConfig } from '@/config/context'
import type { LookupClientResponse } from '@/api/types'
import type { AppointmentAuth } from '@/lib/useAppointmentAuth'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { cx } from '@/lib/utils'
import { FIELD_BASE, FIELD_BORDER, FIELD_BORDER_ERROR, FIELD_LABEL } from '@/components/ui/fieldStyles'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Step 0: "do you already have an account?", shown before lesson search.
 *
 * Existing clients sign in here so the rest of the flow knows who they are (their
 * students are pre-filled at booking and their saved cards are offered at payment)
 * rather than discovering it at the last step. New visitors continue as guests and
 * have an account created for them at booking, so nobody is blocked from browsing
 * availability: see ROADMAP §3.4.
 *
 * The lookup is a **mocked** endpoint (`lookup-client`); see `api/mock.ts`.
 */
export function AccountStep({
  auth,
  onContinue,
}: {
  auth: AppointmentAuth
  onContinue: () => void
}) {
  const config = useConfig()
  const api = useApi()
  const uid = config.random_id

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<'existing' | 'new' | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = email.trim()
    if (!value) return setError(config.get_text('apt_field_required'))
    if (!EMAIL_RE.test(value)) return setError(config.get_text('apt_email_invalid'))

    setChecking(true)
    try {
      const { data } = await api.post<LookupClientResponse>('lookup-client', { email: value })
      setResult(data.exists ? 'existing' : 'new')
    } catch {
      // A failed lookup must not trap the visitor: fall through to the guest path
      // rather than blocking booking on an endpoint that is down.
      setResult('new')
    } finally {
      setChecking(false)
    }
  }

  // Signed in during this step: nothing left to ask.
  if (auth.session) {
    return (
      <div className="tw:max-w-md tw:mx-auto tw:flex tw:flex-col tw:gap-4">
        <Header />
        <Alert variant="success">
          {config.get_text('apt_signed_in_as', { name: auth.session.nm })}
        </Alert>
        <div className="tw:flex tw:gap-2">
          <Button variant="secondary" onClick={auth.signout}>
            {config.get_text('not_you_sign_out')}
          </Button>
          <Button className="tw:flex-1 tw:py-2.5" onClick={onContinue}>
            {config.get_text('apt_continue_to_search')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="tw:max-w-md tw:mx-auto tw:flex tw:flex-col tw:gap-4">
      <Header />

      {result === null && (
        <form onSubmit={check} noValidate className="tw:flex tw:flex-col tw:gap-3">
          <div className="tw:flex tw:flex-col tw:gap-1.5">
            <label htmlFor={`tcs-${uid}-acct-email`} className={FIELD_LABEL}>
              {config.get_text('apt_your_email')}
            </label>
            <input
              id={`tcs-${uid}-acct-email`}
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={!!error}
              aria-describedby={error ? `tcs-${uid}-acct-err` : undefined}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              className={cx(FIELD_BASE, 'tw:w-full', error ? FIELD_BORDER_ERROR : FIELD_BORDER)}
            />
            {error && (
              <div id={`tcs-${uid}-acct-err`} className="tw:text-xs tw:text-error">
                {error}
              </div>
            )}
          </div>
          <Button type="submit" disabled={checking} className="tw:py-2.5">
            {checking ? <Spinner /> : config.get_text('apt_account_check')}
          </Button>
          <button
            type="button"
            onClick={onContinue}
            className="tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
          >
            {config.get_text('apt_skip_account_check')}
          </button>
        </form>
      )}

      {result === 'existing' && (
        <div className="tw:flex tw:flex-col tw:gap-3">
          <Alert variant="info">
            {config.get_text('apt_account_found', { email: email.trim() })}
          </Alert>
          <Button onClick={auth.signin} className="tw:py-2.5">
            {config.get_text('apt_signin_to_book')}
          </Button>
          <ResultLinks onRetry={() => setResult(null)} onSkip={onContinue} />
        </div>
      )}

      {result === 'new' && (
        <div className="tw:flex tw:flex-col tw:gap-3">
          <Alert variant="info">
            {config.get_text('apt_account_not_found', { email: email.trim() })}
          </Alert>
          <Button onClick={onContinue} className="tw:py-2.5">
            {config.get_text('apt_continue_as_guest')}
          </Button>
          <ResultLinks onRetry={() => setResult(null)} />
        </div>
      )}
    </div>
  )
}

/**
 * Ways out of a lookup result. The typed email is kept so a typo is a quick fix,
 * and a client who can't sign in can still skip rather than being stuck.
 */
function ResultLinks({ onRetry, onSkip }: { onRetry: () => void; onSkip?: () => void }) {
  const config = useConfig()
  const link =
    'tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link'
  return (
    <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-x-4 tw:gap-y-1">
      <button type="button" onClick={onRetry} className={link}>
        {config.get_text('apt_use_different_email')}
      </button>
      {onSkip && (
        <button type="button" onClick={onSkip} className={link}>
          {config.get_text('apt_skip_account_check')}
        </button>
      )}
    </div>
  )
}

function Header() {
  const config = useConfig()
  return (
    <div>
      <h3 className="tw:text-base tw:font-medium tw:font-heading">
        {config.get_text('apt_account_title')}
      </h3>
      <p className="tw:text-sm tw:text-muted-dark tw:mt-0.5">
        {config.get_text('apt_account_intro')}
      </p>
    </div>
  )
}
