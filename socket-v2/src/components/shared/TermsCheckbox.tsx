import { useConfig } from '@/config/context'

/**
 * Explicit acceptance of the terms before money or a booking changes hands.
 * `withPolicy` adds the cancellation policy to what is being accepted, which
 * applies to lessons but not to buying credit.
 */
export function TermsCheckbox({
  accepted,
  onChange,
  error,
  withPolicy = true,
}: {
  accepted: boolean
  onChange: (accepted: boolean) => void
  error?: string | null
  withPolicy?: boolean
}) {
  const config = useConfig()
  const termsLink = config.terms_link
  const errorId = `tcs-${config.random_id}-terms-err`
  return (
    <>
      <label className="tw:flex tw:items-start tw:gap-2.5 tw:text-sm tw:cursor-pointer tw:select-none">
        <input
          type="checkbox"
          checked={accepted}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="tw:mt-0.5"
        />
        <span>
          {termsLink ? (
            <>
              {config.get_text('apt_accept_terms_before')}{' '}
              <a href={termsLink} target="_blank" rel="noreferrer" className="tw:underline">
                {config.get_text('terms_link')}
              </a>
              {withPolicy && <> {config.get_text('apt_accept_terms_after')}</>}
            </>
          ) : (
            config.get_text(withPolicy ? 'apt_accept_terms_plain' : 'pkg_accept_terms_plain')
          )}
        </span>
      </label>
      {error && (
        <p id={errorId} className="tw:text-xs tw:text-error tw:-mt-2">
          {error}
        </p>
      )}
    </>
  )
}
