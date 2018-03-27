import React, { Component } from 'react'
import {Link, Route} from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import format from 'date-fns/format'
import {colour_contrast, group_by} from '../../utils'
import {If} from '../shared/Tools'
import {CalendarTimes, CalendarPlus} from '../shared/Svgs' // CalendarCheck
import AptModal from './AptModal'

const group_appointments = apts => {
  // group appointments by month then day
  return group_by(apts, a => a.start.match(/\d{4}-\d{2}/)[0])
    .map(apts_ => ({
      date: apts_[0].start,
      appointments: group_by(apts_, a => a.start.match(/\d{4}-\d{2}-\d{2}/)[0])
    }))
}

const Apt = ({apt, props}) => {
  const full = apt.attendees_max === apt.attendees_count
  const colour = full ? '#CCC' : apt.service_colour
  const tip = full ? 'Lesson fully subscribed' : null
  let Icon = full ? CalendarTimes : CalendarPlus
  return (
    <Link to={props.root.url(`appointment/${apt.link}`)} className="tcs-item">
      <div className={`tcs-apt ${colour_contrast(colour)}`} style={{background: colour}} data-tip={tip}>
        <div>
          <Icon/>
          <span>{format(apt.start, 'HH:mm')}</span>
          <span>{apt.topic} ({apt.service_name})</span>
        </div>
        <div>
          <span>{props.config.format_time_diff(apt.finish, apt.start)}</span>&bull;
          <span>{props.config.format_money(apt.price)}</span>
        </div>
      </div>
      <ReactTooltip effect="solid"/>
    </Link>
  )
}

const AptDayGroup = ({appointments, props}) => {
  const first_apt = appointments[0]
  return (
    <div className="tcs-apt-group-day">
      <div className="tcs-day">
        {format(first_apt.start, 'Do')}
        <br/>
        {format(first_apt.start, 'ddd')}
      </div>
      <div>
        {appointments.map((apt, i) => (
          <Apt key={i} apt={apt} props={props}/>
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
    }
    this.update = this.update.bind(this)
    this.root_url = this.props.root.url('')
  }

  async componentDidMount () {
    await this.update()
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
    const mj = this.props.history.location.pathname.match(/job\/(\d+)/)
    const job_id = mj ? parseInt(mj[1], 10) : null

    const mp = this.props.history.location.pathname.match(/page\/(\d+)/)
    const page = mp ? parseInt(mp[1], 10) : 1
    this.setState({job_id, page})
    const appointments = await this.props.root.requests.get('appointments', {
      service: job_id,
      page: page,
      pagination: this.props.config.pagination,
    })
    this.props.config.event_callback('updated_appointments', appointments)
    const on_previous_pages = (page - 1) * this.props.config.pagination
    this.setState({
      appointments,
      more_pages: appointments.count > appointments.results.length + on_previous_pages,
    })
  }

  render () {
    const appointments = this.state.appointments ? this.state.appointments.results : []
    const months = group_appointments(appointments)
    return (
      <div className="tcs-app tcs-appointments">
        {months.map(({date, appointments}, i) => (
          <div className="tcs-apt-group-month" key={i}>
            <div className="tcs-title">{format(date, 'MMMM')}</div>
            {appointments.map((appointments, i) => (
              <AptDayGroup appointments={appointments} key={i} props={this.props}/>
            ))}
          </div>
        ))}

        <If v={this.state.page > 1 || this.state.more_pages}>
          <div className="tcs-pagination">
            <Link
              to={this.page_url(this.state.page - 1)}
              onClick={() => setTimeout(() => this.update(), 0)}
              className={'tcs-previous' + (this.state.page > 1 ? '' : ' tcs-disable')}>
              &lsaquo;&lsaquo; {this.props.root.get_text('previous')}
            </Link>
            <Link
              to={this.page_url(this.state.page + 1)}
              onClick={() => setTimeout(() => this.update(), 0)}
              className={'tcs-next' + (this.state.more_pages ? '' : ' tcs-disable')}>
              {this.props.root.get_text('next')} &rsaquo;&rsaquo;
            </Link>
          </div>
        </If>
        <Route path={this.props.root.url('appointment/:id(\\d+):_extra')} render={props => (
          <AptModal id={props.match.params.id}
                    last_url={this.root_url}
                    appointments={this.state.appointments && this.state.appointments.results}
                    got_data={Boolean(this.state.appointments)}
                    root={this.props.root}
                    config={this.props.config}
                    update_apts={this.update}
                    history={props.history}/>
        )}/>
      </div>
    )
  }
}

export default Appointments
