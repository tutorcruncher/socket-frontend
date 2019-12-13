import React, { Component } from 'react'
import {Bull, If, IfElse, DisplayExtraAttrs} from '../shared/Tools'
import {Tick, CalendarPlus, CalendarTimes} from '../shared/Svgs'
import Modal from '../shared/Modal'

const get_attendees = (appointment_attendees, apt_id) => (appointment_attendees && appointment_attendees[apt_id]) || []
const NEW_STUDENT_ID = 999999999


const AptDetails = ({apt, spaces_available, attending, props}) => {
  const c = props.config
  const CalendarIcon = spaces_available ? CalendarPlus : CalendarTimes
  return (
    <div>
      <div className="tcs-right tcs-timezone">
        {props.config.get_text('assuming_timezone', {timezone: props.config.timezone})}
      </div>
      <div className={`tcs-apt-details ${spaces_available === 0 ? '' : 'tcs-bookable'}`}>
        <div>
          <CalendarIcon/>
        </div>
        <div className="tcs-price">
          {c.format_money(apt.price)}
        </div>
        <div>
          {c.get_text('spaces', {spaces: spaces_available})}
        </div>
        <IfElse v={apt.start.substr(0, 10) === apt.finish.substr(0, 10)}>
          <div>
            {c.format_dt(apt.start, 'full')}<Bull/>{c.format_duration(apt.finish, apt.start)}
          </div>
          <div>
          {c.format_dt(apt.start, 'full')} - {c.format_dt(apt.finish, 'full')}
          </div>
        </IfElse>
      </div>
    </div>
  )
}

const AddExisting = ({students, book, booking_allowed, get_text}) => (
  students && students.length > 0 &&
  <div className="tcs-book-existing">
    <div>{get_text('add_existing_students')}</div>
    {students.map(({id, name, already_on_apt}) => (
      <div key={id} className="tcs-book-item">
        <div className="tcs-existing-name">
          {name}
        </div>
        {already_on_apt ? (
          <div className="tcs-already-added">
            {get_text('added')} <Tick/>
          </div>
        ) : (
          <button className="tcs-button tcs-add-button"
                  onClick={() => book(id)}
                  disabled={!booking_allowed || already_on_apt}>
            {get_text('add_to_lesson')}
          </button>
        )}
      </div>
    ))}
  </div>
)

const AddNew = ({new_student, onChange, book, booking_allowed, get_text}) => (
  <div className="tcs-book-new">
    <div>{get_text('add_new_student')}</div>
    <div className="tcs-book-item">
      <input type="text"
            className="tcs-default-input"
            placeholder="Student Name"
            required={true}
            maxLength={255}
            value={new_student || ''}
            onChange={onChange}/>
      <button className="tcs-button tcs-add-button"
              onClick={() => book(null)}
              disabled={!booking_allowed || !new_student}>
        {get_text('add_to_lesson')}
      </button>
    </div>
  </div>
)

class AptModal extends Component {
  constructor (props) {
    super(props)
    this.apt_id = parseInt(this.props.id, 10)
    this.book = this.book.bind(this)
    this.state = {
      apt: props.appointments && props.appointments.find(a => a.id === this.apt_id),
      display_data: props.display_data,
      attendees: get_attendees(props.appointment_attendees, this.apt_id),
      new_student: null,
      booking_allowed: true,
      extra_attendees: 0,
    }
    this.update_timeout = null
    this.unmount_signout = false
    this.new_student_id = NEW_STUDENT_ID
  }

  componentWillReceiveProps (nextProps) {
    const new_state = {
      apt: nextProps.appointments && nextProps.appointments.find(a => a.id === this.apt_id),
      attendees: get_attendees(nextProps.appointment_attendees, this.apt_id)
    }
    // don't modify display_data as it might be changed, only set it or unset it
    if (!(this.state.display_data && nextProps.display_data)) {
      new_state.display_data = nextProps.display_data
    }
    if (this.state.apt && new_state.apt && this.state.apt.attendees_count !== new_state.apt.attendees_count) {
      // clear temporary extra_attendees
      new_state.extra_attendees = 0
    }
    this.setState(new_state)
  }

  componentWillUnmount () {
    this.unmount_signout && this.props.signout()
  }

  async book (student_id) {
    this.setState({booking_allowed: false})
    const data = {appointment: this.apt_id}
    if (student_id) {
      data.student_id = student_id
    } else {
      data.student_name = this.state.new_student
    }
    await this.props.root.requests.post('book-appointment', data, {args: this.props.sso_args})
    if (!student_id) {
      const display_data = Object.assign({}, this.state.display_data)
      student_id = this.new_student_id  // so new student appears last
      this.new_student_id += 1
      display_data.srs[student_id] = data.student_name
      this.setState({new_student: null, display_data})
      // force new login when opening another appointment to update students
      this.unmount_signout = true
    }
    const attendees = this.state.attendees.slice()
    attendees.push(student_id)
    this.setState({
      booking_allowed: true,
      extra_attendees: this.state.extra_attendees + 1,
      attendees
    })
    // update with enough time for the data to have been updated in tc
    this.update_timeout && clearTimeout(this.update_timeout)
    this.update_timeout = setTimeout(() => this.props.update(), 5000)
  }

  get_students () {
    return this.state.display_data && Object.entries(this.state.display_data.srs).map(([k, name]) => {
      const s_id = parseInt(k, 10)
      return {
        id: s_id,
        name: name,
        already_on_apt: s_id >= NEW_STUDENT_ID || (this.state.attendees && this.state.attendees.includes(s_id))
      }
    })
  }

  render () {
    if (!this.props.got_data) {
      return (
        <Modal history={this.props.history} title='' config={this.props.config}>
          <p>Loading...</p>
        </Modal>
      )
    }
    const apt = this.state.apt
    if (!apt) {
      return (
        <Modal history={this.props.history}
               parent_el={this.props.config.modal_parent}
               title={this.props.config.get_text('appointment_not_found')}>
          <p>{this.props.config.get_text('appointment_not_found_id', {apt_id: this.props.id})}</p>
        </Modal>
      )
    }
    const title = (
      <span>
        <span className="tcs-circle" style={{background: apt.service_colour}}/>
        {apt.topic} <Bull/> {apt.service_name}
      </span>
    )
    const students = this.get_students()
    let spaces_available = (
      apt.attendees_max === null ? null : apt.attendees_max - apt.attendees_count - this.state.extra_attendees
    )
    const booking_allowed = this.state.booking_allowed && spaces_available !== 0
    return (
      <Modal history={this.props.history}
             title={title}
             last_url={this.props.last_url}
             flex={false}
             config={this.props.config}>
        <AptDetails apt={apt}
                    spaces_available={spaces_available}
                    attending={Boolean(this.state.display_data && this.state.attendees)}
                    props={this.props}/>
        <div>
          <DisplayExtraAttrs extra_attributes={apt.service_extra_attributes}/>
          <div className="tcs-book">
            <If v={this.state.display_data}>
              <div>
                <AddExisting students={students}
                              book={this.book}
                              booking_allowed={booking_allowed}
                              get_text={this.props.config.get_text}/>
                <AddNew new_student={this.state.new_student}
                        onChange={e => this.setState({new_student: e.target.value})}
                        book={this.book}
                        booking_allowed={booking_allowed}
                        get_text={this.props.config.get_text}/>
              </div>
            </If>
            <If v={!this.state.display_data && booking_allowed}>
                <button className="tcs-button tcs-signin" onClick={this.props.signin}>
                  {this.props.config.get_text('book_appointment_button')}
                </button>
            </If>
          </div>

          {this.state.display_data &&
            <div className="tcs-session-name">
              {this.state.display_data.nm}
              <br/>
              <div className="tcs-signout" onClick={this.props.signout}>
                {this.props.config.get_text('not_you_sign_out')}
              </div>
            </div>
          }
        </div>
      </Modal>
    )
  }
}

export default AptModal
