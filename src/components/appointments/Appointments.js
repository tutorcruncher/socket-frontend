import React, { Component } from 'react'
import {Link, Route} from 'react-router-dom'
import {If, AnimateLink} from '../shared/Tools'
import {slugify} from '../../utils'
import AptModal from './AptModal'


class Appointments extends Component {
  constructor (props) {
    super(props)
    this.state = {
      response: null,
      selected_job: null,
      page: 1,
      more_pages: false,
    }
    this.update = this.update.bind(this)
  }

  async componentDidMount () {
    await this.update()
  }

  page_url (page, selected_job) {
    page = page || this.state.page
    selected_job = selected_job || this.state.selected_job
    let url = this.props.root.url('')
    if (this.state.selected_job) {
      url = this.props.root.url(`job/${selected_job.id}-${slugify(selected_job.name)}`)
    }
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
    const response = await this.props.root.requests.get('appointments', {
      service: job_id,
      page: page,
      pagination: this.props.config.pagination,
    })
    this.props.config.event_callback('updated_appointments', response)
    const on_previous_pages = (page - 1) * this.props.config.pagination
    setTimeout(() => this.setState({
      response,
      more_pages: response.count > response.results.length + on_previous_pages,
    }), 0)
  }

  render () {
    const appointments = this.state.response ? this.state.response.results : []
    return (
      <div className="tcs-app tcs-appointments">
        <div>
          appointments
        </div>
        {appointments.map((apt, i) => (
          <AnimateLink key={i}
                       delay={i * 80} to={root.url(`appointment/${apt.id}-${slugify(apt.topic)}`)}
                       className="tcs-item">
            {apt.topic}
          </AnimateLink>
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
                    appointments={this.state.response && this.state.response.results}
                    got_data={Boolean(this.state.response)}
                    root={this.props.root}
                    config={this.props.config}
                    history={props.history}/>
        )}/>
      </div>
    )
  }
}

export default Appointments
