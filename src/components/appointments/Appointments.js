import React, { Component } from 'react'
import {Link, Route} from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import {colour_contrast, group_by} from '../../utils'
import {If, Bull} from '../shared/Tools'
import {CalendarCheck, CalendarPlus, CalendarTimes} from '../shared/Svgs'
import AptModal from './AptModal'

const LS_KEY = '_tcs_user_data_'
// matches value in appointments.scss
const NARROW = 750

const group_appointments = apts => {
  // group appointments by month then day
  return group_by(apts, a => a.start.match(/\d{4}-\d{2}/)[0])
    .map(apts_ => ({
      date: apts_[0].start,
      appointments: group_by(apts_, a => a.start.match(/\d{4}-\d{2}-\d{2}/)[0])
    }))
}

const Apt = ({apt, props, appointment_attendees}) => {
  const full = apt.attendees_max === apt.attendees_count
  const narrow = window.innerWidth < NARROW
  const colour = full ? '#CCC' : apt.service_colour
  let Icon, tip
  const spaces_ctx = {spaces: apt.attendees_max - apt.attendees_count}
  if (appointment_attendees && appointment_attendees[apt.id] !== undefined) {
    Icon = CalendarCheck
    tip = props.config.get_text(full ? 'no_spaces_attending' : 'spaces_attending', spaces_ctx)
  } else {
    Icon = full ? CalendarTimes : CalendarPlus
    tip = props.config.get_text(full ? 'no_spaces' : 'spaces', spaces_ctx)
  }
  return (
    <Link to={props.root.url(`appointment/${apt.link}`)} className="tcs-item">
      <div className={`tcs-apt ${colour_contrast(colour)}`} style={{background: colour}} data-tip={tip}>
        <div>
          <Icon/>
          <span>{props.config.date_fns.format(apt.start, 'HH:mm')}</span>
          <span>{apt.topic}</span>
          {narrow && <br/>}
          <span>({apt.service_name})</span>
        </div>
        <div className="tcs-right">
          <span>{props.config.format_time_diff(apt.finish, apt.start)}</span>
          {narrow ? <br/> :<Bull/>}
          <span>{props.config.format_money(apt.price)}</span>
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
        {props.config.date_fns.format(first_apt.start, 'Do')}
        <br/>
        {props.config.date_fns.format(first_apt.start, 'ddd')}
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
      appointments,
      more_pages: appointments.count > appointments.results.length + on_previous_pages,
    })
    ReactTooltip.rebuild()
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
            <div className="tcs-title">{this.props.config.date_fns.format(date, 'MMMM')}</div>
            {appointments.map((appointments, j) => (
              <AptDayGroup key={j} appointments={appointments} props={this.props}
                appointment_attendees={this.state.appointment_attendees}/>
            ))}
          </div>
        ))}

        <ReactTooltip effect="solid"/>
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