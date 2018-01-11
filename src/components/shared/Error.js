import React from 'react'

const HELP_SITE = 'help.tutorcruncher.com/tc-socket/'

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
