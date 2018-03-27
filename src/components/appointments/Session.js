import React, { Component } from 'react'
import {IfElse, Markdown, DetailGrid, Detail} from '../shared/Tools'
import {Tick} from '../shared/Svgs'
import Modal from '../shared/Modal'

const LS_KEY = '_tcs_user_data_'

class AptModal extends Component {
  constructor (props) {
    super(props)
    this.login = this.login.bind(this)
    this.process_message = this.process_message.bind(this)
    this.update_session = this.update_session.bind(this)
    this.check_client = this.check_client.bind(this)
    this.signout = this.signout.bind(this)
    this.state = {
      signature: null,
      sso_data: null,
      display_data: null,
      appointment_attendees: null,
    }
    this.timeout_id = null
    window.addEventListener('message', this.process_message, false)
    this.update_session(window.sessionStorage[LS_KEY])
  }

  login () {
    const url = `${this.props.config.auth_url}?site=${encodeURIComponent(window.location.href)}`
    window.open(url, 'Auth', 'width=1000,height=700,left=100,top=100,scrollbars,toolbar=0,resizable')
  }

  process_message (event) {
    const success = this.update_session(event.data)
    if (success) {
      event.source.close()
      window.sessionStorage[LS_KEY] = event.data
    }
  }

  update_session (raw_data) {
    let data
    try {
      data = JSON.parse(raw_data)
    } catch (e) {
      return false
    }
    data.display_data = JSON.parse(data.sso_data)
    this.setState(data)
    this.check_client(data)
    return true
  }

  async check_client (data) {
    data = data || this.state
    const args = {signature: data.signature, sso_data: data.sso_data}
    try {
      const r = await this.props.root.requests.get('check-client', args, {set_app_state: false})
      this.setState({appointment_attendees: r.appointment_attendees[this.apt_id] || [], booking_allowed: true})
    } catch (e) {
      if (e.xhr.status === 401) {
        this.signout()
      } else {
        this.props.root.setState({error: e.msg})
      }
    }
  }

  signout () {
    this.setState({
      signature: null,
      sso_data: null,
      display_data: null,
      appointment_attendees: null,
    })
    window.sessionStorage.removeItem(LS_KEY)
  }

  render () {
    if (!this.props.got_data) {
      return (
        <Modal history={this.props.history} title=''>
          <p>Loading...</p>
        </Modal>
      )
    }
    const apt = this.state.apt
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
    const students = this.get_students()
    const spaces_available = apt.attendees_max - apt.attendees_count - this.state.extra_attendees
    const booking_allowed = this.state.booking_allowed && spaces_available > 0
    return (
      <Modal history={this.props.history} title={title} last_url={this.props.last_url} flex={false}>
        <div className="tcs-modal-flex">
          <div className="tcs-extra">
            <div className="tcs-price">
              {this.props.config.format_money(apt.price)}
              <div className="tcs-label">Price</div>
            </div>
          </div>
          <div className="tcs-content">
            <DetailGrid>
              <Detail label="Job">
                {apt.service_name}
              </Detail>
              {apt.attendees_max && <Detail label="Spaces Available">{spaces_available}</Detail>}
              <Detail label="Start" className="tcs-new-line">{this.props.config.format_datetime(apt.start)}</Detail>
              <Detail label="Finish">{this.props.config.format_datetime(apt.finish)}</Detail>
              {apt.location && <Detail label="Location">{apt.location}</Detail>}
            </DetailGrid>
          </div>
        </div>

        <div>
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
                <div>
                  {students && (
                    <div className="tcs-book-existing">
                      <div>Add your existing Students to the lesson</div>
                      {students.map(({id, name, already_on_apt}) => (
                        <div key={id} className="tcs-book-item">
                          <div className="tcs-existing-name">
                            {name}
                          </div>
                          {already_on_apt ? (
                            <div className="tcs-already-added">
                              Added <Tick/>
                            </div>
                          ) : (
                            <button className="tcs-button tcs-add-button"
                                    onClick={() => this.book(id)}
                                    disabled={!booking_allowed || already_on_apt}>
                              {this.props.root.get_text('add_to_lesson')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="tcs-book-new">
                    <div>Add a new Student to the lesson</div>
                    <div className="tcs-book-item">
                      <input type="text"
                            className="tcs-default-input"
                            placeholder="Student Name"
                            required={true}
                            maxLength={255}
                            value={this.state.new_student || ''}
                            onChange={e => this.setState({new_student: e.target.value})}/>
                      <button className="tcs-button tcs-add-button"
                              onClick={() => this.book(null)}
                              disabled={!booking_allowed || !this.state.new_student}>
                        {this.props.root.get_text('add_to_lesson')}
                      </button>
                    </div>
                  </div>
                </div>
              {/*else*/}
                <button className="tcs-button tcs-signin" onClick={this.login}>
                  {this.props.root.get_text('book_appointment_button')}
                </button>
            </IfElse>
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
      </Modal>
    )
  }
}

export default AptModal
