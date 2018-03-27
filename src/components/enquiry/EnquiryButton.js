import React from 'react'
import {Link, Route} from 'react-router-dom'
import EnquiryModal from './EnquiryModal'

const EnquiryButton = ({root, config}) => (
  <div className="tcs-app">
    <div className="tcs-enquiry-modal">
      <Link to={root.url('enquiry')} className="tcs-button tcs-enquiry-button">
        {config.get_text('enquiry_button')}
      </Link>

      <Route path={root.url('enquiry')} render={props => (
        <EnquiryModal root={root} config={config} history={props.history}/>
      )}/>
    </div>
  </div>
)

export default EnquiryButton
