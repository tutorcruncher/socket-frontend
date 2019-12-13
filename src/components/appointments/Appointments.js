import React, { Component } from 'react'
import {Link, Route} from 'react-router-dom'
import {colour_contrast, group_by} from '../../utils'
import {If, Bull} from '../shared/Tools'
import AptModal from './AptModal'

const LS_KEY = '_tcs_user_data_'

const group_appointments = apts => {
  // group appointments by month then day
  return group_by(apts, a => a.start.substr(0, 7))
    .map(apts_ => ({
      date: apts_[0].start,
      appointments: group_by(apts_, a => a.start.substr(0, 10))
    }))
}

const Apt = ({apt, props, appointment_attendees}) => {
  let status
  const spaces_ctx = {spaces: apt.attendees_max === null ? null : apt.attendees_max - apt.attendees_count}
  if (appointment_attendees && appointment_attendees[apt.id] !== undefined) {
    status = props.config.get_text('spaces_attending', spaces_ctx)
  } else {
    status = props.config.get_text('spaces', spaces_ctx)
  }
  return (
    <Link to={props.root.url(`appointment/${apt.link}`)} className="tcs-item">
      <div className={`tcs-apt ${colour_contrast(apt.service_colour)}`} style={{background: apt.service_colour}}>
        <div style={{fontWeight: 700, marginRight: 8, minWidth: 68}}>
          {props.config.format_dt(apt.start, 'time')}
        </div>
        <div className="tcs-truncate">
          {apt.topic}<Bull/>{apt.service_name}
        </div>
        <div className="tcs-right" style={{fontWeight: 700}}>
        {props.config.format_money(apt.price)}
        </div>
        <div className="tcs-truncate" style={{gridColumn: 2}}>
          {status}
        </div>
        <div className="tcs-right">
          {props.config.format_duration(apt.finish, apt.start)}
        </div>
      </div>
    </Link>
  )
}

const AptDayGroup = ({appointments, props, appointment_attendees}) => {
  const first_apt = appointments[0]
  return (
    <div className="tcs-apt-group-day">
      <div className="tcs-day">
        {props.config.format_dt(first_apt.start, 'weekday')}
        <div className="tcs-day-no">{props.config.format_dt(first_apt.start, 'day')}</div>
      </div>
      <div>
        {appointments.map(apt => (
          <Apt key={apt.id} apt={apt} props={props} appointment_attendees={appointment_attendees}/>
        ))}
      </div>
    </div>
  )
}

class Appointments extends Component {
  constructor (props) {
    super(props)
    this.state = {
      appointments: null,
      page: 1,
      more_pages: false,
      display_data: null,
      appointment_attendees: null,
    }
    this.sso_args = null
    this.update = this.update.bind(this)
    this.signin = this.signin.bind(this)
    this.signout = this.signout.bind(this)
    this.root_url = this.props.root.url('')
  }

  componentDidMount () {
    this.update_display_data()
    this.update()
  }

  page_url (page) {
    page = page || this.state.page
    let url = this.root_url
    if (page > 1) {
      url += `${url.substr(-1) === '/' ? '' : '/'}page/${page}`
    }
    return url
  }

  async update () {
    const mp = this.props.history.location.pathname.match(/page\/(\d+)/)
    const page = mp ? parseInt(mp[1], 10) : 1
    const appointments = await this.props.root.requests.get('appointments', {
      page, pagination: this.props.config.pagination,
    })
    this.props.config.event_callback('updated_appointments', appointments)
    const on_previous_pages = (page - 1) * this.props.config.pagination
    this.sso_args && await this.update_attendees()
    this.setState({
      appointments, page,
      more_pages: appointments.count > appointments.results.length + on_previous_pages,
    })
  }

  signin () {
    const process_message = event => {
      try {
        JSON.parse(event.data)
      } catch (e) {
        return
      }
      event.source.close()
      window.sessionStorage[LS_KEY] = event.data
      this.update_display_data()
      this.update_attendees()
    }
    window.addEventListener('message', process_message, false)
    window.open(
      `${this.props.config.auth_url}?site=${encodeURIComponent(window.location.href)}`,
      'Auth',
      'width=1000,height=700,left=100,top=100,scrollbars,toolbar=0,resizable'
    )
  }

  signout () {
    this.setState({
      display_data: null,
      appointment_attendees: null,
    })
    this.sso_args = null
    window.sessionStorage.removeItem(LS_KEY)
  }

  update_display_data () {
    const raw_data = window.sessionStorage[LS_KEY]
    if (raw_data) {
      this.sso_args = JSON.parse(raw_data)
      this.setState({display_data: JSON.parse(this.sso_args.sso_data)})
    }
  }

  async update_attendees () {
    try {
      const r = await this.props.root.requests.get('check-client', this.sso_args, {set_app_state: false})
      this.setState({appointment_attendees: r.appointment_attendees})
    } catch (e) {
      if (e.xhr.status === 401) {
        this.signout()
      } else {
        this.props.root.setState({error: e.msg})
      }
    }
  }

  render () {
    const appointments = this.state.appointments ? this.state.appointments.results : []
    const months = group_appointments(appointments)
    return (
      <div className="tcs-app tcs-appointments">
        {months.map(({date, appointments}, i) => (
          <div className="tcs-apt-group-month" key={i}>
            <div className="tcs-title">{this.props.config.format_dt(date, 'month')}</div>
            {appointments.map((appointments, j) => (
              <AptDayGroup key={j} appointments={appointments} props={this.props}
                appointment_attendees={this.state.appointment_attendees}/>
            ))}
          </div>
        ))}

        <If v={this.state.page > 1 || this.state.more_pages}>
          <div className="tcs-pagination">
            <Link
              to={this.page_url(this.state.page - 1)}
              onClick={() => setTimeout(() => this.update(), 0)}
              className={'tcs-previous' + (this.state.page > 1 ? '' : ' tcs-disable')}>
              &lsaquo;&lsaquo; {this.props.config.get_text('previous')}
            </Link>
            <Link
              to={this.page_url(this.state.page + 1)}
              onClick={() => setTimeout(() => this.update(), 0)}
              className={'tcs-next' + (this.state.more_pages ? '' : ' tcs-disable')}>
              {this.props.config.get_text('next')} &rsaquo;&rsaquo;
            </Link>
          </div>
        </If>
        <Route path={this.props.root.url('appointment/:id(\\d+):_extra')} render={props => (
          <AptModal id={props.match.params.id}
                    last_url={this.root_url}
                    appointments={this.state.appointments && this.state.appointments.results}
                    got_data={Boolean(this.state.appointments)}
                    display_data={this.state.display_data}
                    appointment_attendees={this.state.appointment_attendees}
                    sso_args={this.sso_args}
                    root={this.props.root}
                    config={this.props.config}
                    update={this.update}
                    signin={this.signin}
                    signout={this.signout}
                    history={props.history}/>
        )}/>
      </div>
    )
  }
}

export default Appointments
