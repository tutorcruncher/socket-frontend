import React from 'react'

const DEFAULT_HELP_URL = 'https://help.tutorcruncher.com/en/articles/8255881-getting-started-with-tutorcruncher-socket'

const HELP_URLS = {
  appointments: 'https://help.tutorcruncher.com/en/articles/14182713-online-lesson-booking-socket',
}

export const help_url = mode => HELP_URLS[mode] || DEFAULT_HELP_URL

const Error = ({children, mode}) => {
  const help = help_url(mode)
  return (
    <div className="tcs-errors">
      <p>An error occurred while loading TutorCruncher socket:</p>
      <p className="tcs-error-content">{children}</p>
      <p>
        It's likely that you've configured socket wrongly. You might get more information from the developer console,
        or <a target="_blank" rel="noopener noreferrer" href={help}>{help}</a>,
        if you still can't work out what's wrong contact support@tutorcruncher.com.
      </p>
    </div>
  )
}

export default Error
