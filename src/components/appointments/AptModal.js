import React, { Component } from 'react'
import {IfElse, Markdown, DetailGrid, Detail} from '../shared/Tools'
import Modal from '../shared/Modal'

class AptModal extends Component {
  constructor (props) {
    super(props)
    this.apt_id = parseInt(this.props.id, 10)
    this.login = this.login.bind(this)
    this.process_message = this.process_message.bind(this)
    this.update_session = this.update_session.bind(this)
    this.signout = this.signout.bind(this)
    this.state = {
      signature: null,
      sso_data: null,
      display_data: null,
      appointment_attendees: null,
      new_student: null,
    }
  }

  componentDidMount () {
    window.addEventListener('message', this.process_message, false)
    this.update_session(window.sessionStorage.__tcs_user_data)
  }

  login () {
    const url = `${this.props.config.auth_url}?site=${encodeURIComponent(window.location.href)}`
    window.open(url, 'Auth', 'width=1000,height=700,left=100,top=100,scrollbars,toolbar=0,resizable')
  }

  process_message (event) {
    console.log('message:', event)
    const success = this.update_session(event.data)
    if (success) {
      event.source.close()
      window.sessionStorage.__tcs_user_data = event.data
    }
  }

  update_session (raw_data) {
    console.log('raw data:', raw_data)
    let data
    try {
      data = JSON.parse(raw_data)
    } catch (e) {
      return false
    }
    data.display_data = JSON.parse(data.sso_data)
    console.log('data:', data)
    this.setState(data)

    const args = {signature: data.signature, sso_data: data.sso_data}
    this.props.root.requests.get('check-client', args).then(data => {
      this.setState({appointment_attendees: data.appointment_attendees})
    })
    return true
  }

  signout () {
    this.setState({
      signature: null,
      sso_data: null,
      display_data: null,
      appointment_attendees: null,
    })
    window.sessionStorage.removeItem('__tcs_user_data')
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
    const title = (
      <span>
        <span className="tcs-circle" style={{background: apt.service_colour}}/>
        {apt.topic}
      </span>
    )
    return (
      <Modal history={this.props.history} title={title} last_url={this.props.last_url}>
        <div className="tcs-extra">
          <div className="tcs-price">
            £{apt.price}
            <div className="tcs-label">Price</div>
          </div>
          {this.state.display_data &&
            <div className="tcs-session-name">
              {this.state.display_data.nm}
              <div className="tcs-signout" onClick={this.signout}>
                Not you? sign out
              </div>
            </div>
          }
        </div>

        <div className="tcs-content">
          <div className="tcs-colour-line"/>
          <DetailGrid>
            <Detail label="Job">
              {apt.service_name}
            </Detail>
            {apt.attendees_max && <Detail label="Spaces Available">{apt.attendees_max - apt.attendees_count}</Detail>}
            <Detail label="Start" className="tcs-new-line">{this.props.config.format_datetime(apt.start)}</Detail>
            <Detail label="Finish">{this.props.config.format_datetime(apt.finish)}</Detail>
            {apt.location && <Detail label="Location">{apt.location}</Detail>}
          </DetailGrid>
          {apt.service_extra_attributes.map((attr, i) => (
            <div key={i} className="tcs-attr">
              <h3 className="tcs-attr-title">{attr.name}</h3>
              <IfElse v={attr.type === 'text_short' || attr.type === 'text_extended'}>
                <Markdown content={attr.value}/>
              {/*else*/}
                <p>{attr.value}</p>
              </IfElse>
            </div>
          ))}
          <div className="tcs-book">
            <IfElse v={this.state.display_data}>
                <div className="tcs-book-new">
                  <div>Add a new Student to the lesson:</div>
                  <div>
                    <input type="text"
                           className="tcs-default-input"
                           placeholder="Student Name"
                           required={true}
                           maxLength={255}
                           value={this.state.new_student || ''}
                           onChange={e => this.setState({new_student: e.target.value})}/>
                    <button className="tcs-button" onClick={this.login} disabled={!this.state.new_student}>
                      {this.props.root.get_text('add_to_lesson')}
                    </button>
                  </div>
                </div>
              {/*else*/}
                <button className="tcs-button tcs-signin" onClick={this.login}>
                  {this.props.root.get_text('book_appointment_button')}
                </button>
            </IfElse>
          </div>
        </div>
      </Modal>
    )
  }
}

export default AptModal
