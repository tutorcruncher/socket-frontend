import React from 'react'
import EnquiryForm from '../shared/EnquiryForm'

const PlainEnquiry = ({root, config}) => (
  <div className="tcs-app">
    <EnquiryForm root={root} config={config}/>
  </div>
)
export default PlainEnquiry
