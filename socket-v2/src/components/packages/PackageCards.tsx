import { useConfig } from '@/config/context'
import type { CreditPackage } from '@/api/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { cx } from '@/lib/utils'

/**
 * The package's marker: its colour with the currency symbol. TutorCruncher stores a
 * Font Awesome icon name, but the widget ships no icon font, so the colour carries it.
 */
export function PackageTile({ pkg, className }: { pkg: CreditPackage; className?: string }) {
  const config = useConfig()
  return (
    <span
      aria-hidden="true"
      className={cx(
        'tw:flex tw:items-center tw:justify-center tw:w-11 tw:h-11 tw:rounded-lg tw:shrink-0 tw:text-lg tw:font-semibold',
        className,
      )}
      // Literal white: the tile sits on the package's own colour in every theme.
      style={{ background: pkg.icon_colour || '#1f374e', color: '#ffffff' }}
    >
      {config.currency?.symbol ?? ''}
    </span>
  )
}

/** The packages on sale: what you pay, any bonus, and the credit you end up with. */
export function PackageCards({
  packages,
  onChoose,
}: {
  packages: CreditPackage[]
  onChoose: (pkg: CreditPackage) => void
}) {
  const config = useConfig()
  return (
    <ul className="tw:grid tw:gap-4 tw:sm:grid-cols-2 tw:lg:grid-cols-3">
      {packages.map((pkg) => (
        <li
          key={pkg.id}
          className="tcs-slot tw:flex tw:flex-col tw:gap-3 tw:p-4 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm"
        >
          <div className="tw:flex tw:items-center tw:gap-3">
            <PackageTile pkg={pkg} />
            <h3 className="tw:text-lg tw:font-medium tw:font-heading">{pkg.name}</h3>
          </div>
          {pkg.description && (
            <div className="tw:text-sm tw:text-muted-dark">
              <Markdown content={pkg.description} />
            </div>
          )}
          {/* Pinned to the bottom so prices and buttons line up across cards. */}
          <div className="tw:mt-auto tw:flex tw:flex-col tw:gap-2">
            <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-2 tw:gap-y-1">
              <span className="tw:text-2xl tw:font-semibold tw:text-heading">
                {config.format_money(pkg.cost)}
              </span>
              {pkg.bonus_credit > 0 && (
                <Badge variant="success">
                  {config.get_text('pkg_bonus', { amount: config.format_money(pkg.bonus_credit) })}
                </Badge>
              )}
            </div>
            <p className="tw:text-sm tw:text-muted-dark">
              {config.get_text('pkg_you_get', {
                amount: config.format_money(pkg.cost + pkg.bonus_credit),
              })}
            </p>
            <Button onClick={() => onChoose(pkg)} className="tw:w-full">
              {config.get_text('pkg_choose')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
