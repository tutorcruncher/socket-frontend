import React from 'react'

const Error = ({children}) => (
  <div className="tcs-errors">
    <p>
      An error occurred with TutorCruncher socket:
    </p>
    <p className="tcs-error-content">{children}</p>
    <p>
      It's likely that you've configured socket wrongly. You might get more information from the developer console, or
      <a target="_blank" rel="noopener noreferrer" href="https://help.tutorcruncher.com/tc-socket/">help.tutorcruncher.com/tc-socket/</a>,
      if you can't work out what's wrong contact support@tutorcruncher.com.
    </p>
  </div>
)

export default Error
