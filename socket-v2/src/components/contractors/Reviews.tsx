import { useState } from 'react'
import { useConfig } from '@/config/context'
import type { Review } from '@/api/types'
import type { ResolvedConfig } from '@/config/types'

const FILLED = '#f8be15'
const EMPTY = '#d4d4d8'

/**
 * A compact 5-star row for a single review. Deliberately simpler than `ui/Stars`:
 * individual reviews carry whole-star ratings, so there is no fractional fill to
 * clip and no hours-reviewed caption.
 */
function ReviewStars({ rating }: { rating: number }) {
  const label = `${rating} out of 5`
  return (
    <span className="tw:inline-flex tw:gap-0.5 tw:shrink-0" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 1792 1792" className="tw:w-3 tw:h-3" aria-hidden="true">
          <path
            fill={i < rating ? FILLED : EMPTY}
            d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"
          />
        </svg>
      ))}
    </span>
  )
}

/** Review dates come from the API: a malformed one must not crash the profile. */
function formatCreated(config: ResolvedConfig, created: string): string | null {
  if (Number.isNaN(new Date(created + 'Z').getTime())) return null
  return config.format_dt(created, 'month_year')
}

/**
 * Written reviews on a tutor profile (ROADMAP §3.1).
 *
 * Social proof is the highest-leverage element on a "choose a tutor" page, and a
 * star average alone doesn't provide it: a prospect wants to read a sentence in
 * someone else's voice. Renders nothing when the tutor has no reviews rather than
 * showing an empty section, so new tutors don't look worse than unrated ones.
 */
/**
 * How many to show before "show all". Three is enough to establish credibility;
 * beyond that the profile turns into a wall of boxes and the skills table (the
 * thing a parent scrolls for next) gets pushed below the fold.
 */
const PREVIEW_COUNT = 2

export function Reviews({ reviews }: { reviews: Review[] | undefined }) {
  const config = useConfig()
  const [expanded, setExpanded] = useState(false)
  if (!config.show_stars || !reviews?.length) return null

  const shown = expanded ? reviews : reviews.slice(0, PREVIEW_COUNT)
  const hidden = reviews.length - shown.length

  return (
    <div>
      <h3 className="tw:text-base tw:font-medium tw:font-heading tw:mb-1">
        {config.get_text('reviews_title')}
      </h3>
      {/* Divider-separated rows rather than bordered cards: four boxed panels
          stacked full-width read as heavier than the bio above them, which is
          backwards for supporting content. */}
      <ul className="tw:flex tw:flex-col tw:divide-y tw:divide-default">
        {shown.map((r) => (
          <li key={r.id} className="tw:py-2.5">
            {/* Attribution reads as one run (stars, who, what, when) rather than
                splitting the date to the far edge where it detaches from the name. */}
            <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-1.5 tw:gap-y-0.5">
              <ReviewStars rating={r.rating} />
              <span className="tw:text-xs tw:text-muted-dark tw:min-w-0">
                {[r.author, r.service, formatCreated(config, r.created)]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
            <p className="tw:text-sm tw:mt-1">{r.body}</p>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="tw:mt-1.5 tw:text-sm tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          {config.get_text('reviews_show_all', { count: reviews.length })}
        </button>
      )}
    </div>
  )
}
