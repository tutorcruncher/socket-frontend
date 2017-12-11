import React, { Component } from 'react'
import {Route, Switch, withRouter} from 'react-router-dom'
import {google_analytics, requests} from '../utils'
import Error from './Error'
import Grid from './Grid'
import ConDetails from './ConDetails'

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

  render () {
    if (this.state.error) {
      return <Error>{this.state.error}</Error>
    }
    return (
      <div className="tcs-app">
        <Grid config={this.props.config} contractors={this.state.contractors}/>

        <Switch>
          <Route path="/:id([0-9]+):_extra" render={props => (
            <ConDetails id={props.match.params.id}
                        contractors={this.state.contractors}
                        history={props.history}/>
          )}/>
        </Switch>
      </div>
    )
  }
}

export default withRouter(App)
