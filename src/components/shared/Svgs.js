import React from 'react'

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
    <span>v{process.env.REACT_APP_RELEASE}</span>
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

// https://github.com/encharm/Font-Awesome-SVG-PNG/blob/master/black/svg/check.svg
export const Tick = () => (
  <svg className="tcs-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M1671 566q0 40-28 68l-724 724-136 136q-28 28-68
      28t-68-28l-136-136-362-362q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68
      28l136 136q28 28 28 68z"/>
  </svg>
)

// https://fontawesome.com/icons/calendar-times?style=solid
export const CalendarTimes = () => (
  <svg className="tcs-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path d="M436 160H12c-6.6 0-12-5.4-12-12v-36c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12
      12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48v36c0 6.6-5.4 12-12 12zM12
      192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm257.3
      160l48.1-48.1c4.7-4.7 4.7-12.3 0-17l-28.3-28.3c-4.7-4.7-12.3-4.7-17 0L224 306.7l-48.1-48.1c-4.7-4.7-12.3-4.7-17
      0l-28.3 28.3c-4.7 4.7-4.7 12.3 0 17l48.1 48.1-48.1 48.1c-4.7 4.7-4.7 12.3 0 17l28.3 28.3c4.7 4.7 12.3 4.7 17
      0l48.1-48.1 48.1 48.1c4.7 4.7 12.3 4.7 17 0l28.3-28.3c4.7-4.7 4.7-12.3 0-17L269.3 352z"/>
  </svg>
)

// https://fontawesome.com/icons/calendar-plus?style=solid
export const CalendarPlus = () => (
  <svg className="tcs-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path d="M436 160H12c-6.6 0-12-5.4-12-12v-36c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12
      12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48v36c0 6.6-5.4 12-12 12zM12
      192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm316
      140c0-6.6-5.4-12-12-12h-60v-60c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v60h-60c-6.6 0-12 5.4-12 12v40c0
      6.6 5.4 12 12 12h60v60c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12v-60h60c6.6 0 12-5.4 12-12v-40z"/>
  </svg>
)

// https://fontawesome.com/icons/calendar-check?style=solid
export const CalendarCheck = () => (
  <svg className="tcs-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path d="M436 160H12c-6.627 0-12-5.373-12-12v-36c0-26.51 21.49-48 48-48h48V12c0-6.627 5.373-12 12-12h40c6.627 0
      12 5.373 12 12v52h128V12c0-6.627 5.373-12 12-12h40c6.627 0 12 5.373 12 12v52h48c26.51 0 48 21.49 48 48v36c0
      6.627-5.373 12-12 12zM12 192h424c6.627 0 12 5.373 12 12v260c0 26.51-21.49 48-48 48H48c-26.51
      0-48-21.49-48-48V204c0-6.627 5.373-12 12-12zm333.296
      95.947l-28.169-28.398c-4.667-4.705-12.265-4.736-16.97-.068L194.12
      364.665l-45.98-46.352c-4.667-4.705-12.266-4.736-16.971-.068l-28.397 28.17c-4.705 4.667-4.736
      12.265-.068 16.97l82.601 83.269c4.667 4.705 12.265 4.736 16.97.068l142.953-141.805c4.705-4.667
      4.736-12.265.068-16.97zz"/>
  </svg>
)
