import React from 'react'
import {Link, Route} from 'react-router-dom'
import EnquiryModal from './EnquiryModal'

const EnquiryButton = ({root, config}) => (
  <div className="tcs-app">
    <Link to={root.url('enquiry')} className="tcs-enquiry-button">
      {root.get_text('enquiry_button')}
    </Link>

    <Route path={root.url('enquiry')} render={props => (
      <EnquiryModal root={root} config={config} history={props.history}/>
    )}/>
  </div>
)

export default EnquiryButton
