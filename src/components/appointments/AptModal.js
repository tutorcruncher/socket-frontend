import React, { Component } from 'react'
import {IfElse, Markdown} from '../shared/Tools'
import Modal from '../shared/Modal'

class AptModal extends Component {
  constructor (props) {
    super(props)
    this.apt_id = parseInt(this.props.id, 10)
  }

  render () {
    if (!this.props.got_data) {
      return (
        <Modal history={this.props.history} title=''>
          <p>Loading...</p>
        </Modal>
      )
    }
    const apt = this.props.appointments.find(a => a.id === this.apt_id)
    if (!apt) {
      return (
        <Modal history={this.props.history} title="Appointment not Found">
          <p>No Appointment found with id {this.props.id}.</p>
        </Modal>
      )
    }
    return (
      <Modal history={this.props.history} title={apt.topic} last_url={this.props.last_url}>
        <div className="tcs-content">
          <h3>{apt.service_name}</h3>
          {apt.service_extra_attributes.map((attr, i) => (
            <div key={i} className="tcs-attr">
              <h3>{attr.name}</h3>
              <IfElse v={attr.type === 'text_short' || attr.type === 'text_extended'}>
                <Markdown content={attr.value}/>
              {/*else*/}
                <p>{attr.value}</p>
              </IfElse>
            </div>
          ))}
          <div>
            <code>{JSON.stringify(apt, null, 2)}</code>
          </div>
        </div>
      </Modal>
    )
  }
}

export default AptModal
