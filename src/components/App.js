import React, { Component } from 'react'
import {Route, Switch, withRouter} from 'react-router-dom'
import {google_analytics, requests, to_markdown, async_start} from '../utils'
import Error from './Error'
import Grid from './Grid'
import ConModal from './ConModal'

class App extends Component {
  constructor (props) {
    super(props)
    this.ga_prefixes = google_analytics(props.history, props.config)
    this.state = {
      error: props.error,
      contractors: []
    }
    this.setStateMounted = this.setStateMounted.bind(this)
    this.get_contractors = this.get_contractors.bind(this)
    this.get_text = this.get_text.bind(this)
    this.get_contractor_details = this.get_contractor_details.bind(this)
    this.set_contractor_details = this.set_contractor_details.bind(this)
    this.requests = {
      get: async (path, args) => requests.get(this, path, args),
      post: async (path, data) => requests.post(this, path, data),
    }
  }

  async componentDidMount () {
    this._ismounted = true
    await this.get_contractors()
  }

  componentWillUnmount () {
    this._ismounted = false
  }

  setStateMounted (s) {
    this._ismounted && this.setState(s)
  }

  async get_contractors () {
    // if (this.$route.name === 'index') {
    //   if (this.$route.params.type === 's' && this.$route.params.link) {
    //     this.$set(this, 'selected_subject_id', parseInt(this.$route.params.link.match(/\d+/)[0]))
    //   } else {
    //     this.$set(this, 'selected_subject_id', null)
    //   }
    // }
    // const args = {subject: this.selected_subject_id}

    const contractors = await this.requests.get('contractors')
    this.setStateMounted({contractors})
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
    this.setStateMounted({[state_ref]: null})
    this.setStateMounted({[state_ref]: await this.requests.get(url)})
  }

  get_text (name, replacements, is_markdown) {
    let s = this.props.config.messages[name]
    for (let [k, v] of Object.entries(replacements || {})) {
      s = s.replace(`{${k}}`, v)
    }
    if (is_markdown) {
      return to_markdown(s)
    } else {
      return s
    }
  }

  render () {
    if (this.state.error) {
      return <Error>{this.state.error}</Error>
    }
    return (
      <div className="tcs-app">
        <Grid config={this.props.config} contractors={this.state.contractors}/>

        <Switch>
          <Route path="/:id([0-9]+):_extra" render={props => (
            <ConModal id={props.match.params.id}
                      contractors={this.state.contractors}
                      get_text={this.get_text}
                      get_contractor_details={this.get_contractor_details}
                      history={props.history}/>
          )}/>
        </Switch>
      </div>
    )
  }
}

export default withRouter(App)
