import React, { Component } from 'react'
import {Route, Switch, withRouter} from 'react-router-dom'
import {google_analytics, requests, async_start} from '../utils'
import Error from './shared/Error'
import Grid from './contractors/Grid'
import ConModal from './contractors/ConModal'

class App extends Component {
  constructor (props) {
    super(props)
    this.ga_prefixes = google_analytics(props.history, props.config)
    this.state = {
      error: props.error,
      contractors: [],
      got_contractors: false,
      enquiry_form_info: null,
    }
    this.get_contractors = this.get_contractors.bind(this)
    this.get_text = this.get_text.bind(this)

    this.get_contractor_details = this.get_contractor_details.bind(this)
    this.set_contractor_details = this.set_contractor_details.bind(this)

    this.get_enquiry = this.get_enquiry.bind(this)
    this.set_enquiry = this.set_enquiry.bind(this)

    this.ga_event = this.ga_event.bind(this)
    this.requests = {
      get: async (...args) => requests.get(this, ...args),
      post: async (...args) => requests.post(this, ...args),
    }
  }

  async componentDidMount () {
    await this.get_contractors()
  }

  async get_contractors (subject_id) {
    this.setState({
      contractors: await this.requests.get('contractors', {subject: subject_id || null}),
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
    this.setState({[state_ref]: await this.requests.get(url)})
  }

  get_text (name, replacements) {
    let s = this.props.config.messages[name]
    for (let [k, v] of Object.entries(replacements || {})) {
      s = s.replace(`{${k}}`, v)
    }
    return s
  }

  get_enquiry () {
    if (this.state.enquiry_form_info === null) {
      async_start(this.set_enquiry)
    }
    return this.state.enquiry_form_info
  }

  async set_enquiry () {
    this.setState({enquiry_form_info: {}})
    this.setState({enquiry_form_info: await this.requests.get('enquiry')})
  }

  ga_event (category, action, label) {
    /* istanbul ignore next */
    for (let prefix of this.ga_prefixes) {
      console.debug('ga sending event', prefix, category, action, label)
      window.ga(prefix + 'send', 'event', category, action, label)
    }
  }

  render () {
    if (this.state.error) {
      return <Error>{this.state.error}</Error>
    }
    return (
      <div className="tcs-app">
        <Grid config={this.props.config}
              contractors={this.state.contractors}
              get_contractors={this.get_contractors}
              get_text={this.get_text}
              requests={this.requests}/>

        <Switch>
          <Route path="/:id([0-9]+):_extra" render={props => (
            <ConModal id={props.match.params.id}
                      contractors={this.state.contractors}
                      got_contractors={this.state.got_contractors}
                      root={this}
                      config={this.props.config}
                      history={props.history}/>
          )}/>
        </Switch>
      </div>
    )
  }
}

export default withRouter(App)
