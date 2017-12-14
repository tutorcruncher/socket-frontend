import React from 'react'
import Modal from '../shared/Modal'
import EnquiryForm from '../shared/EnquiryForm'


const EnquiryModal = ({root, config, history}) => (
  <Modal history={history} title={root.get_text('enquiry_title')}>
    <div className="tcs-body">
      <div className="tcs-content">
        <EnquiryForm root={root} config={config}/>
      </div>
    </div>
  </Modal>
)

export default EnquiryModal
