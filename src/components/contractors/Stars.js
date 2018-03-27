import React from 'react'
import ReactTooltip from 'react-tooltip'

const STAR_PATH = 'M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 ' +
  '236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 ' +
  '49-41t49 41l225 455 502 73q56 9 56 46z'
const STAR_COLOUR = '#f8be15'
const RAW_STAR_GAP = 200
// standard svg size
const RAW_STAR_SIZE = 1792
const RAW_STAR_STEP = RAW_STAR_SIZE + RAW_STAR_GAP
const MAX_STARS = 5
// makes 5 stars 140 px wide
const STAR_SIZE = 31
const STAR_WIDTH = Math.round(RAW_STAR_SIZE / RAW_STAR_STEP * STAR_SIZE)
let star_def_id = 0
const int_range = v => Array.apply(null, {length: v}).map(Number.call, Number)

const Stars = ({contractor, config}) => {
  if (typeof contractor.review_rating !== 'number') {
    return null
  }
  // defined shapes need globally unique ids
  const clip_id = `fill-clip-${star_def_id}`
  const stroked_id =`stroked-${star_def_id}`
  const filled_id =`filled-${star_def_id}`
  star_def_id += 1
  const score = contractor.review_rating
  const stroke_stars = int_range(MAX_STARS)
  const full_stars = int_range(Math.ceil(score))
  // tweak score to make it fit in better with stroke
  let score_stars = score
  let score_prop = score % 1
  if (0.95 > score_prop && score_prop > 0.7) {
    score_stars -= 0.15
  } else if (0.05 < score_prop && score_prop < 0.3) {
    score_stars += 0.15
  }
  const comment = typeof contractor.review_duration === 'number' &&
    config.get_text('review_hours', {hours: Math.round(contractor.review_duration / 3600)})
  const star_display = `${Math.round(score * 10) / 10} Stars`
  return (
    <div className="tcs-stars">
      <svg style={{width: STAR_WIDTH * MAX_STARS, height: STAR_SIZE}}
           className="tcs-svg"
           data-tip={star_display}
           viewBox={`0 0 ${RAW_STAR_STEP * MAX_STARS} 1792`}
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id={stroked_id} d={STAR_PATH} fill="white" fillOpacity="0" stroke={STAR_COLOUR} strokeWidth={80}/>
          <path id={filled_id} d={STAR_PATH} fill={STAR_COLOUR}/>
          <clipPath id={clip_id}>
            <rect x="0" y="0" width={RAW_STAR_STEP * score_stars} height="1792" />
          </clipPath>
        </defs>
        {stroke_stars.map(i => (
          <use key={i} xlinkHref={`#${stroked_id}`} x={RAW_STAR_STEP * i} y="0" />
        ))}
        <g style={{clipPath: `url(#${clip_id})`}}>
          {full_stars.map(i => (
            <use key={i} xlinkHref={`#${filled_id}`} x={RAW_STAR_STEP * i} y="0" />
          ))}
        </g>
      </svg>
      <div>
        {comment && <span className="tcs-comment">{comment}</span>}
      </div>
      <ReactTooltip effect="solid"/>
    </div>
  )
}

export default Stars
