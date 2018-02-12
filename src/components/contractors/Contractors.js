import React, { Component } from 'react'
import {Link, Route} from 'react-router-dom'
import {async_start, slugify} from '../../utils'
import {If} from '../shared/Tools'
import {Grid, List} from './List'
import ConModal from './ConModal'
import SelectSubjects from './SelectSubjects'

class Contractors extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contractors: [],
      got_contractors: false,
      page: 1,
      more_pages: false,
      subjects: [],
      selected_subject: null,
      last_url: null,
    }
    this.update_contractors = this.update_contractors.bind(this)
    this.get_contractor_details = this.get_contractor_details.bind(this)
    this.set_contractor_details = this.set_contractor_details.bind(this)
    this.subject_url = this.subject_url.bind(this)
    this.page_url = this.page_url.bind(this)
    this.subject_change = this.subject_change.bind(this)
  }

  async componentDidMount () {
    if (this.state.subjects.length === 0) {
      const subjects = await this.props.root.requests.get('subjects')
      this.props.config.event_callback('get_subjects', subjects)
      this.setState({subjects})
    }

    await this.update_contractors()
  }

  subject_url (selected_subject) {
    if (selected_subject) {
      return this.props.root.url(`subject/${selected_subject.id}-${slugify(selected_subject.name)}`)
    } else {
      return this.props.root.url('')
    }
  }

  page_url (new_page) {
    let url = this.subject_url(this.state.selected_subject)
    if (new_page > 1) {
      url += `${url.substr(-1) === '/' ? '' : '/'}page/${new_page}`
    }
    return url
  }

  subject_change (selected_subject) {
    const url = this.subject_url(selected_subject)
    this.props.history.push(url)
    this.setState({last_url: url})
    this.update_contractors(selected_subject)
  }

  async update_contractors (selected_subject) {
    if (!selected_subject) {
      const m = this.props.history.location.pathname.match(/subject\/(\d+)/)
      const subject_id = m ? parseInt(m[1], 10) : null
      if (subject_id && this.state.subjects.length > 0) {
        selected_subject = this.state.subjects.find(s => s.id === subject_id)
      }
    }

    const m = this.props.history.location.pathname.match(/page\/(\d+)/)
    const page = m ? parseInt(m[1], 10) : 1
    this.setState({selected_subject, page})
    const args = Object.assign({}, this.props.config.contractor_filter, {
      subject: selected_subject ? selected_subject.id : null,
      pagination: this.props.config.pagination,
      page: page,
    })
    const data = await this.props.root.requests.get('contractors', args)
    let contractors
    if (Array.isArray(data)) {
      contractors = data
    } else {
      contractors = data.results
    }
    this.props.config.event_callback('updated_contractors', contractors)
    this.setState({contractors: []})
    setTimeout(() => this.setState({
      contractors,
      got_contractors: true,
      more_pages: contractors.length === this.props.config.pagination,
    }), 0)
  }

  get_contractor_details (con) {
    const state_ref = 'con_extra_' + con.id
    const con_extra = this.state[state_ref]
    if (con_extra === undefined) {
      async_start(this.set_contractor_details, con.url, state_ref)
    }
    return con_extra
  }

  async set_contractor_details (url, state_ref) {
    this.setState({[state_ref]: null})
    const con_details = await this.props.root.requests.get(url)
    this.props.config.event_callback('get_contractor_details', con_details)
    this.setState({[state_ref]: con_details})
  }

  render () {
    const DisplayComponent = this.props.config.mode === 'grid' ? Grid : List
    return (
      <div className="tcs-app tcs-contractors">
        <If v={this.state.got_contractors && this.props.config.subject_filter}>
          <SelectSubjects get_text={this.props.root.get_text}
                          contractors={this.state.contractors}
                          subjects={this.state.subjects}
                          selected_subject={this.state.selected_subject}
                          subject_change={this.subject_change}/>
        </If>
        <DisplayComponent contractors={this.state.contractors} root={this.props.root}/>
        <If v={this.state.got_contractors && this.state.contractors.length === 0}>
          <div className="tcs-no-contractors">
            {this.props.root.get_text('no_tutors_found')}
          </div>
        </If>

        <If v={this.state.page > 1 || this.state.more_pages}>
          <div className="tcs-pagination">
            <Link
              to={this.page_url(this.state.page - 1)}
              onClick={() => setTimeout(() => this.update_contractors(), 0)}
              className={'tcs-previous' + (this.state.page > 1 ? '' : ' tcs-disable')}>
              &lsaquo;&lsaquo; {this.props.root.get_text('previous')}
            </Link>
            <Link
              to={this.page_url(this.state.page + 1)}
              onClick={() => setTimeout(() => this.update_contractors(), 0)}
              className={'tcs-next' + (this.state.more_pages ? '' : ' tcs-disable')}>
              {this.props.root.get_text('next')} &rsaquo;&rsaquo;
            </Link>
          </div>
        </If>
        <Route path={this.props.root.url(':id(\\d+):_extra')} render={props => (
          <ConModal id={props.match.params.id}
                    last_url={this.state.last_url}
                    contractors={this.state.contractors}
                    got_contractors={this.state.got_contractors}
                    get_contractor_details={this.get_contractor_details}
                    root={this.props.root}
                    config={this.props.config}
                    history={props.history}/>
        )}/>
      </div>
    )
  }
}

export default Contractors
