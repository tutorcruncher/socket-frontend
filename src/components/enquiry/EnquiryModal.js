import React from 'react'
import Modal from '../shared/Modal'
import EnquiryForm from '../shared/EnquiryForm'

const EnquiryModal = ({root, config, history}) => (
  <Modal history={history} title={config.get_text('enquiry_title')} parent_el={config.modal_parent}>
    <div className="tcs-content">
      <EnquiryForm root={root} config={config} mode='enquiry-modal'/>
    </div>
  </Modal>
)

export default EnquiryModal
