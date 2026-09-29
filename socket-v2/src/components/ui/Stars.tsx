import { useId } from 'react'
import { useConfig } from '@/config/context'
import type { ContractorSummary } from '@/api/types'

const STAR_PATH =
  'M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 ' +
  '236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 ' +
  '49-41t49 41l225 455 502 73q56 9 56 46z'
const STAR_COLOUR = '#f8be15'
// Darker outline so stars meet WCAG non-text contrast (5:1 on white) and the
// empty-star scale stays perceivable for low-vision users.
const STAR_STROKE = '#8a6a00'
const RAW_STAR_GAP = 200
const RAW_STAR_SIZE = 1792
const RAW_STAR_STEP = RAW_STAR_SIZE + RAW_STAR_GAP
const MAX_STARS = 5
const STAR_SIZE = 28
const STAR_WIDTH = Math.round((RAW_STAR_SIZE / RAW_STAR_STEP) * STAR_SIZE)

const intRange = (v: number) => Array.from({ length: v }, (_, i) => i)

/** Star rating display with fractional fill and an hours-reviewed caption. */
export function Stars({
  contractor,
}: {
  contractor: Pick<ContractorSummary, 'review_rating' | 'review_duration' | 'review_count'>
}) {
  const config = useConfig()
  const uid = useId().replace(/:/g, '')
  if (!config.show_stars || typeof contractor.review_rating !== 'number') return null

  const clipId = `tcs-clip-${uid}`
  const strokedId = `tcs-stroked-${uid}`
  const filledId = `tcs-filled-${uid}`
  const score = contractor.review_rating

  // Nudge the fill slightly so fractional stars sit nicely within the outline.
  let scoreStars = score
  const scoreProp = score % 1
  if (scoreProp > 0.7 && scoreProp < 0.95) scoreStars -= 0.15
  else if (scoreProp > 0.05 && scoreProp < 0.3) scoreStars += 0.15

  // Prefer the review count: "(14 hours)" is hours *tutored*, which reads as a
  // review count and isn't one. Fall back to hours only when no count is served
  // (ROADMAP §3.1), so existing tenants lose nothing.
  const count = contractor.review_count
  const comment =
    typeof count === 'number' && count > 0
      ? config.get_text('review_count', { count })
      : config.show_hours_reviewed && typeof contractor.review_duration === 'number'
        ? config.get_text('review_hours', { hours: Math.round(contractor.review_duration / 3600) })
        : null
  const starDisplay = `${Math.round(score * 10) / 10} Stars`

  return (
    <div
      className="tw:flex tw:flex-wrap tw:items-center tw:justify-center tw:gap-x-2 tw:gap-y-0.5"
      title={starDisplay}
    >
      <svg
        style={{ width: STAR_WIDTH * MAX_STARS, height: STAR_SIZE }}
        className="tw:shrink-0"
        viewBox={`0 0 ${RAW_STAR_STEP * MAX_STARS} 1792`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label={starDisplay}
      >
        <defs>
          <path id={strokedId} d={STAR_PATH} fill="white" fillOpacity="0" stroke={STAR_STROKE} strokeWidth={70} />
          <path id={filledId} d={STAR_PATH} fill={STAR_COLOUR} stroke={STAR_STROKE} strokeWidth={30} />
          <clipPath id={clipId}>
            <rect x="0" y="0" width={RAW_STAR_STEP * scoreStars} height="1792" />
          </clipPath>
        </defs>
        {intRange(MAX_STARS).map((i) => (
          <use key={i} xlinkHref={`#${strokedId}`} x={RAW_STAR_STEP * i} y="0" />
        ))}
        <g style={{ clipPath: `url(#${clipId})` }}>
          {intRange(Math.ceil(score)).map((i) => (
            <use key={i} xlinkHref={`#${filledId}`} x={RAW_STAR_STEP * i} y="0" />
          ))}
        </g>
      </svg>
      {comment && (
        <span className="tw:text-xs tw:text-muted-dark tw:whitespace-nowrap">{comment}</span>
      )}
    </div>
  )
}
