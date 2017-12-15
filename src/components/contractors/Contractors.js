import React, { Component } from 'react'
import {Route} from 'react-router-dom'
import {async_start, slugify} from '../../utils'
import Grid from './Grid'
import ConModal from './ConModal'

class Contractors extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contractors: [],
      got_contractors: false,
      subjects: [],
      selected_subject: null,
    }
    this.update_contractors = this.update_contractors.bind(this)
    this.get_contractor_details = this.get_contractor_details.bind(this)
    this.set_contractor_details = this.set_contractor_details.bind(this)
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

  subject_change (selected_subject) {
    if (selected_subject) {
      this.props.history.push(this.props.root.url(`subject/${slugify(selected_subject.name)}`))
    } else {
      this.props.history.push(this.props.root.url(''))
    }
    this.update_contractors(selected_subject)
  }

  async update_contractors (selected_subject) {
    if (!selected_subject) {
      const m = this.props.history.location.pathname.match(/subject\/([^/]+)/)
      const subject_slug = m ? m[1] : null
      if (subject_slug && this.state.subjects.length > 0) {
        selected_subject = this.state.subjects.find(s => slugify(s.name) === subject_slug)
      }
    }

    this.setState({selected_subject})
    const sub_id = selected_subject && selected_subject.id
    const contractors = await this.props.root.requests.get('contractors', {subject: sub_id || null})
    this.props.config.event_callback('updated_contractors', contractors)
    this.setState({
      contractors,
      got_contractors: true
    })
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
    return (
      <div className="tcs-app">
        <Grid config={this.props.config}
              history={this.props.history}
              contractors={this.state.contractors}
              subjects={this.state.subjects}
              selected_subject={this.state.selected_subject}
              subject_change={this.subject_change}
              root={this.props.root}/>

        <Route path={this.props.root.url(':id([0-9]+):_extra')} render={props => (
          <ConModal id={props.match.params.id}
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
