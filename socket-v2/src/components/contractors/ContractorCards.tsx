import { Link } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import type { ContractorSummary } from '@/api/types'
import { Photo } from '@/components/shared/Photo'
import { Markdown } from '@/components/ui/Markdown'
import { Stars } from '@/components/ui/Stars'
import { LocationIcon } from '@/components/ui/Icons'

/** Grid view — photo + name cards in a responsive grid. */
export function Grid({ contractors }: { contractors: ContractorSummary[] }) {
  const url = useUrl()
  return (
    <div className="tw:grid tw:grid-cols-2 tw:sm:grid-cols-3 tw:md:grid-cols-4 tw:gap-4">
      {contractors.map((c) => (
        <Link
          key={c.id}
          to={url(c.link)}
          className="tw:group tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:overflow-hidden tw:transition-shadow tw:hover:shadow-md tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link tw:focus-visible:outline-offset-2"
        >
          <div className="tw:aspect-square tw:bg-content tw:overflow-hidden">
            <Photo
              src={c.photo}
              alt={c.name}
              className="tw:w-full tw:h-full tw:transition-transform tw:duration-300 tw:group-hover:scale-105"
            />
          </div>
          <h3 className="tw:text-sm tw:font-medium tw:text-heading tw:px-3 tw:py-2 tw:text-center tw:truncate">
            {c.name}
          </h3>
        </Link>
      ))}
    </div>
  )
}

/** List view — richer rows with photo, bio, rating and location. */
export function List({ contractors }: { contractors: ContractorSummary[] }) {
  const config = useConfig()
  const url = useUrl()
  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      {contractors.map((c) => (
        <Link
          key={c.id}
          to={url(c.link)}
          className="tw:flex tw:flex-col tw:sm:flex-row tw:gap-4 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:p-4 tw:transition-shadow tw:hover:shadow-md tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link tw:focus-visible:outline-offset-2"
        >
          <div className="tw:flex tw:sm:flex-col tw:items-center tw:gap-3 tw:sm:w-32 tw:shrink-0">
            <div className="tw:w-24 tw:h-24 tw:sm:w-32 tw:sm:h-32 tw:rounded-lg tw:overflow-hidden tw:bg-content">
              <Photo src={c.photo} alt={c.name} className="tw:w-full tw:h-full" />
            </div>
            <span className="tw:tc-view-profile tw:hidden tw:sm:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:rounded-lg tw:bg-primary tw:text-white">
              {config.get_text('view_profile')}
            </span>
          </div>

          <div className="tw:flex-1 tw:min-w-0">
            <h3 className="tw:text-base tw:font-medium tw:text-heading">{c.name}</h3>
            {c.tag_line && <div className="tw:text-sm tw:text-muted-dark tw:mt-0.5">{c.tag_line}</div>}
            {c.primary_description && (
              <div className="tw:relative tw:mt-2 tw:max-h-16 tw:overflow-hidden">
                <Markdown content={c.primary_description} />
              </div>
            )}
          </div>

          <div className="tw:flex tw:flex-row tw:sm:flex-col tw:sm:items-end tw:justify-between tw:gap-2 tw:shrink-0">
            <Stars contractor={c} />
            {c.town && (
              <div className="tw:flex tw:items-center tw:gap-1 tw:text-sm tw:text-muted-dark">
                <LocationIcon className="tw:w-3.5 tw:h-3.5" />
                <span>{c.town}</span>
                {c.distance !== null && (
                  <span className="tw:text-xs tw:text-muted-dark">
                    · {config.get_text('distance_away', { distance: Math.round(c.distance / 100) / 10 })}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
