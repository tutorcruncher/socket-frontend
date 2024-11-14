import React from 'react'

const HELP_SITE = 'https://help.tutorcruncher.com/en/articles/8255881-getting-started-with-tutorcruncher-socket'

const Error = ({children}) => (
  <div className="tcs-errors">
    <p>An error occurred while loading TutorCruncher socket:</p>
    <p className="tcs-error-content">{children}</p>
    <p>
      It's likely that you've configured socket wrongly. You might get more information from the developer console,
      or <a target="_blank" rel="noopener noreferrer" href={'https://' + HELP_SITE}>{HELP_SITE}</a>,
      if you still can't work out what's wrong contact support@tutorcruncher.com.
    </p>
  </div>
)

export default Error
