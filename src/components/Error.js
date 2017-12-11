import React from 'react'

const Error = props => (
  <div className="tcs-errors">
    <h2>Error</h2>
    <p>
      An error occurred with TutorCruncher socket:
    </p>
    <p className="tcs-error-content">{props.children}</p>
    <dl>
      <dt>If you're visiting this site:</dt>
      <dd>
        Get in touch with the owners of the site and let them know their TutorCruncher socket plugin isn't working.
      </dd>

      <dt>If you're developing this site:</dt>
      <dd>
        You might get more information from the developer console, if you can't work out what's wrong contact
        support@tutorcruncher.com.
      </dd>
    </dl>
  </div>
)

export default Error

