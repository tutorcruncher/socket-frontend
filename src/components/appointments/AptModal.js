import React, { Component } from 'react'
import Modal from '../shared/Modal'

class AptModal extends Component {
  constructor (props) {
    super(props)
    this.apt_id = parseInt(this.props.id, 10)
    this.get_appointment = this.get_appointment.bind(this)
  }

  get_appointment () {
    return {foo: this.apt_id}  // TODO
  }

  render () {
    if (!this.props.got_data) {
      return (
        <Modal history={this.props.history} title=''>
          <p>Loading...</p>
        </Modal>
      )
    }
    const apt  = this.get_appointment()
    if (!apt) {
      return (
        <Modal history={this.props.history} title="Appointment not Found">
          <p>No Appointment found with id {this.props.id}.</p>
        </Modal>
      )
    }
    return (
      <Modal history={this.props.history} title={apt.topic}>
        <code>{JSON.stringify(apt, null, 2)}</code>
      </Modal>
    )
  }
}

export default AptModal
