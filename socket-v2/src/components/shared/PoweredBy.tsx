import { cx } from '@/lib/utils'

/**
 * "Powered by TutorCruncher" attribution banner.
 *
 * Socket is embedded on an agency's own site, so this is the only TC branding a
 * visitor sees. It stays deliberately quiet (muted text on the content
 * background) because it sits inside someone else's page and must read as a
 * credit, not as an advert competing with the host's own design.
 *
 * `variant`:
 *  - `panel`:  flush inside a bordered container (the modal footer): full-width
 *               top border and shaded background.
 *  - `inline`: after free-standing widget content: just a top rule and spacing,
 *               so it does not look like a detached box on the host page.
 */
export function PoweredBy({
  variant = 'inline',
  className,
}: {
  variant?: 'panel' | 'inline'
  className?: string
}) {
  return (
    <div
      className={cx(
        'tw:flex tw:items-center tw:justify-end tw:gap-2 tw:border-t tw:border-default',
        variant === 'panel' ? 'tw:px-4 tw:sm:px-6 tw:py-3 tw:bg-content tw:shrink-0' : 'tw:mt-4 tw:pt-3',
        className,
      )}
    >
      <a
        href="https://tutorcruncher.com"
        target="_blank"
        rel="noreferrer"
        className="tw:text-xs tw:text-muted-dark tw:hover:text-link tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
      >
        Powered by TutorCruncher
      </a>
    </div>
  )
}
