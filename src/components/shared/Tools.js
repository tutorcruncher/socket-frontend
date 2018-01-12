import React from 'react'
import { to_markdown } from '../../utils'

// this is the svg for map icon straight from
// https://github.com/encharm/Font-Awesome-SVG-PNG/blob/master/black/svg/times.svg
export const Cross = () => (
  <svg className="tcs-svg tcs-close" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68
      28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68
      28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
  </svg>
)

// taken and modified (compressed path) from
// https://github.com/tutorcruncher/TutorCruncher-branding/blob/master/dino-flat.svg
export const Footer = () => (
  <div className="tcs-footer">
    <span>v{process.env.REACT_APP_RELEASE ? process.env.REACT_APP_RELEASE : '-'}</span>
    <a href="https://tutorcruncher.com" target="blank" className="tcs-footer">
      <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(524,-293)">
          <path d="m 64,1157 c 0,-21 -1,-33 -9,-85 -5,-33 -9,-61 -9,-62 0,-4 -4,-1 -19,12 l -15,14 -53,0 -53,
            0 -37,23 c -20,12 -56,35 -79,49 l -41, 26 -27,-1 c -14,-0 -27,-1 -28,-1 -0, -0 3,-2 8,-5 4,-2 9,-6 9,
            -6 0,-0 -9, -9 -21,-18 -89,-72 -138,-113 -136,-114 1, -0 8,-2 15, -3 l 13,-2 78,48 c 43,26 79, 48 80,
            49 1,0 2,-3 2,-12 l 0, -13 138, -112 138,-112 8,-18 8,-18 91,-90 91, -90 0,-85 0,-85 23, -16 23,-16 64,
            3 c 35, 1 64,3 64,3 0,0 1,10 2,22 1, 17 1, 23 -0,24 -1,1 -21,13 -44,27 -23, 14 -42,26 -43,27 -1,2 -44,
            254 -43,261 0, 1 10,21 22,43 12,21 22,40 21,40 -0, 0 -4, -0 -9,-1 -11,-2 -15,-1 -12,4 0, 2 1,5 1,6 0,
            1 -16,-2 -53,-14 -14, -4 -29,-9 -32,-9 l -5,-0 -5,23 c -2,12 -6, 30 -8,39 -2,8 -5,27 -8,40 l -4,24 -19,
            9 c -10,5 -19,10 -20,10 -0,0 6,10 15, 22 l 16,21 -1,11 c -0,6 -2,23 -4,37 l -3, 26 -11,14 -11,
            14 16,16 16,16 -15,1 c -23, 1 -72,4 -79,4 l -6,0 0,-24 z"/>
        </g>
      </svg>
      Powered by TutorCruncher
    </a>
  </div>
)

// this is the svg for map icon straight from
// https://github.com/encharm/Font-Awesome-SVG-PNG/blob/master/black/svg/map-marker.svg
export const Location = () => (
  <svg className="tcs-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M1152 640q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zm256 0q0 109-33
      179l-364 774q-16 33-47.5 52t-67.5 19-67.5-19-46.5-52l-365-774q-33-70-33-179 0-212 150-362t362-150
      362 150 150 362z"/>
  </svg>
)

const STAR_PATH = 'M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 ' +
  '236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 ' +
  '49-41t49 41l225 455 502 73q56 9 56 46z'
const STAR_COLOUR = '#f8be15'
const RAW_STAR_GAP = 200
// standard svg size
const RAW_STAR_SIZE = 1792
const RAW_STAR_STEP = RAW_STAR_SIZE + RAW_STAR_GAP
const NO_STARS = 5
// makes 5 stars 140 px wide
const STAR_SIZE = 31
const STAR_WIDTH = Math.round(RAW_STAR_SIZE / RAW_STAR_STEP * STAR_SIZE)
let star_def_id = 0
const int_range = v => Array.apply(null, {length: v}).map(Number.call, Number)

export const Stars = ({score}) => {
  // defined shapes need globally unique ids
  const clip_id = `fill-clip-${star_def_id}`
  const stroked_id =`stroked-${star_def_id}`
  const filled_id =`filled-${star_def_id}`
  star_def_id += 1
  score = score || 5
  const stroke_stars = int_range(NO_STARS)
  const full_stars = int_range(Math.ceil(score))
  // // tweak score to make it fit in better with stroke
  let score_stars = score
  let score_prop = score % 1
  if (0.95 > score_prop && score_prop > 0.7) {
    score_stars -= 0.15
  } else if (0.05 < score_prop && score_prop < 0.3) {
    score_stars += 0.15
  }
  return (
    <div className="tcs-stars">
      <svg style={{width: STAR_WIDTH * NO_STARS, height: STAR_SIZE}}
           className='tcs-svg'
           viewBox={`0 0 ${RAW_STAR_STEP * NO_STARS} 1792`}
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
        {Math.round(score * 10) / 10} / {NO_STARS}
      </div>
    </div>
  )
}

export const If = ({v, children}) => (v ? children : <div/>)

export const IfElse = ({v, children}) => {
  if (children.length !== 2) {
    return <div style={{color: 'red'}}>{`IfElse should receive 2 children, not ${children.length}`}</div>
  } else if (v) {
    return children[0]
  } else {
    return children[1]
  }
}

export const Switch = ({children}) => {
  // All but the last child of a Switch component must be "If" components
  for (let c of children.slice(0, children.length - 1)) {
    if (c.props.v) {
      return c.props.children
    }
  }
  return children[children.length - 1]
}

export const Markdown = ({content}) => (
  <div className="tcs-md" dangerouslySetInnerHTML={{__html: to_markdown(content)}}/>
)
