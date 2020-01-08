import React, { Component } from 'react'
import {Link, Route} from 'react-router-dom'
import {slugify, sleep} from '../../utils'
import {If} from '../shared/Tools'
import {Grid, List} from './List'
import ConModal from './ConModal'
import {SubjectSelect, LocationInput} from './Filters'

export default class Contractors extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contractor_response: null,
      page: 1,
      more_pages: false,
      subjects: [],
      selected_subject: null,
      last_url: null,
      location_str: null,
    }
  }

  async componentDidMount () {
    if (this.state.subjects.length === 0) {
      const subjects = await this.props.root.requests.get('subjects')
      this.props.config.event_callback('get_subjects', subjects)
      this.setState({subjects})
    }

    await this.update_contractors()
  }

  subject_url = selected_subject => {
    if (selected_subject) {
      return this.props.root.url(`subject/${selected_subject.id}-${slugify(selected_subject.name)}`)
    } else {
      return this.props.root.url('')
    }
  }

  page_url = new_page => {
    let url = this.subject_url(this.state.selected_subject)
    if (new_page > 1) {
      url += `${url.substr(-1) === '/' ? '' : '/'}page/${new_page}`
    }
    return url
  }

  subject_change = selected_subject => {
    const url = this.subject_url(selected_subject)
    this.props.history.push(url)
    this.setState({last_url: url})
    this.update_contractors(selected_subject)
  }

  location_change = loc => {
    this.setState({location_str: loc})
  }

  submit_location = location_str => {
    this.update_contractors(this.state.selected_subject, location_str)
  }

  update_contractors = async (selected_subject, location_str) => {
    if (!selected_subject) {
      const m = this.props.history.location.pathname.match(/subject\/(\d+)/)
      const subject_id = m ? parseInt(m[1], 10) : null
      if (subject_id && this.state.subjects.length > 0) {
        selected_subject = this.state.subjects.find(s => s.id === subject_id)
      }
    }
    if (location_str === undefined) {
      location_str = this.state.location_str
    }

    const m = this.props.history.location.pathname.match(/page\/(\d+)/)
    const page = m ? parseInt(m[1], 10) : 1
    this.setState({selected_subject, page})
    const args = Object.assign({}, this.props.config.contractor_filter, {
      subject: selected_subject ? selected_subject.id : null,
      pagination: this.props.config.pagination,
      sort: this.props.config.sort_on,
      page: page,
      location: location_str,
    })
    const contractor_response = await this.props.root.requests.get('contractors', args)
    this.props.config.event_callback('updated_contractors', contractor_response)
    this.setState({contractor_response: {results: []}})
    const on_previous_pages = (page - 1) * this.props.config.pagination
    setTimeout(() => this.setState({
      contractor_response,
      more_pages: contractor_response.count > contractor_response.results.length + on_previous_pages,
    }), 0)
  }

  get_contractor = async (contractor_id, set_state) => {
    // make sure update_contractors has finished before getting the contractor to avoid unnecessary requests
    while (!this.state.contractor_response) {
      await sleep(50)
    }

    const state_ref = `con_extra_${contractor_id}`
    let contractor = this.state[state_ref]
    if (contractor) {
      set_state({contractor, loaded: true})
      return
    }

    const contractor_summary = this.state.contractor_response.results.find(c => c.id === contractor_id)
    let url
    if (contractor_summary) {
      set_state({contractor: contractor_summary, loaded: true})
      url = contractor_summary.url
    } else {
      url = `contractors/${contractor_id}`
    }

    let r = await this.props.root.requests.get(url, null, {expected_statuses: [200, 404]})
    if (r.status === 404) {
      set_state({contractor: null, loaded: true})
      return
    }
    contractor = r.data
    this.props.config.event_callback('get_contractor_details', contractor)

    this.setState({[state_ref]: contractor})
    set_state({contractor, loaded: true})
  }

  render () {
    const con_count = this.state.contractor_response && this.state.contractor_response.count
    const location_pretty = (
      this.state.contractor_response &&
      this.state.contractor_response.location &&
      this.state.contractor_response.location.pretty
    )

    let error_message = null
    let description = null
    if (con_count === 0) {
      const location_error = this.state.contractor_response.location && this.state.contractor_response.location.error
      // location error can be 'rate_limited' pr 'no_results'
      if (location_error === 'rate_limited') {
        error_message = this.props.config.get_text('no_tutors_found_rate_limited')
      } else if (location_error === 'no_results') {
        error_message = this.props.config.get_text('no_tutors_found_no_loc', {location: this.state.location_str})
      } else if (location_pretty) {
        error_message = this.props.config.get_text('no_tutors_found_loc', {location: location_pretty})
      } else {
        error_message = this.props.config.get_text('no_tutors_found')
      }
    } else if (con_count > 0) {
      description = [
        location_pretty,
        this.state.selected_subject && this.state.selected_subject.name,
        this.props.config.get_text('filter_summary_' + (con_count === 1 ? 'single' : 'plural'), {count: con_count})
      ].filter(Boolean).join(' • ')
    }
    const DisplayComponent = this.props.config.mode === 'grid' ? Grid : List
    return (
      <div className="tcs-app tcs-contractors">
        <If v={this.state.contractor_response}>
          <div className="tcs-filters-container">
            <LocationInput get_text={this.props.config.get_text}
                           show={this.props.config.show_location_search}
                           loc_raw={this.state.location_str}
                           loc_change={this.location_change}
                           submit={this.submit_location}/>

            <SubjectSelect get_text={this.props.config.get_text}
                           show={this.props.config.show_subject_filter}
                           subjects={this.state.subjects}
                           selected_subject={this.state.selected_subject}
                           subject_change={this.subject_change}/>
          </div>
          <div key="summary" className="tcs-summary">
            {description}
          </div>
        </If>
        <DisplayComponent
          contractors={this.state.contractor_response ? this.state.contractor_response.results : []}
          config={this.props.config}
          root={this.props.root}/>
        <If v={error_message}>
          <div className="tcs-no-contractors">
            {error_message}
          </div>
        </If>

        <If v={this.state.page > 1 || this.state.more_pages}>
          <div className="tcs-pagination">
            <Link
              to={this.page_url(this.state.page - 1)}
              onClick={() => setTimeout(() => this.update_contractors(), 0)}
              className={'tcs-previous' + (this.state.page > 1 ? '' : ' tcs-disable')}>
              &lsaquo;&lsaquo; {this.props.config.get_text('previous')}
            </Link>
            <Link
              to={this.page_url(this.state.page + 1)}
              onClick={() => setTimeout(() => this.update_contractors(), 0)}
              className={'tcs-next' + (this.state.more_pages ? '' : ' tcs-disable')}>
              {this.props.config.get_text('next')} &rsaquo;&rsaquo;
            </Link>
          </div>
        </If>
        <Route path={this.props.root.url(':id(\\d+):_extra')} render={props => (
          <ConModal
              id={props.match.params.id}
              last_url={this.state.last_url}
              get_contractor={this.get_contractor}
              root={this.props.root}
              config={this.props.config}
              history={props.history}
          />
        )}/>
      </div>
    )
  }
}
