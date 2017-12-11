import React, { Component } from 'react'
import {Route, Switch, withRouter} from 'react-router-dom'
import {google_analytics} from '../utils'
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
    this.request = this.request.bind(this)
    this.setStateMounted = this.setStateMounted.bind(this)
    this.get_contractors = this.get_contractors.bind(this)
  }

  async componentDidMount () {
    this._ismounted = true
    await this.get_contractors()
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
    const args = {subject: null}  // TODO {subject: this.selected_subject_id}

    const contractors = await this.request('contractors', args)
    this.setStateMounted({contractors})
  }

  async request (path, data, method, expected_statuses) {
    let url = `${this.props.config.api_root}/${this.props.public_key}/${path}`
    method = method || 'GET'
    let send_data = null
    if (method === 'GET' && data) {
      const arg_list = []
      for (let [name, value] of Object.entries(data)) {
        if (value !== null) {
          arg_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(value))
        }
      }
      if (arg_list.length > 0) {
        url += '?' + arg_list.join('&')
      }
    } else if (data) {
      send_data = data
    }

    if (Number.isInteger(expected_statuses)) {
      expected_statuses = [expected_statuses]
    } else {
      expected_statuses = expected_statuses || [200]
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const on_error = msg => {
        console.error('request error', msg, url, xhr)
        reject(msg)
        this.setStateMounted({error: msg})
      }
      xhr.open(method, url)
      xhr.setRequestHeader('Accept', 'application/json')
      xhr.onload = () => {
        if (expected_statuses.includes(xhr.status)) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          on_error(`wrong response code ${xhr.status}`)
        }
      }
      xhr.onerror = () => on_error(`${xhr.statusText}: ${xhr.status}`)
      xhr.send(send_data)
    })
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
            <ConModal id={props.match.params.id}/>
          )}/>
        </Switch>
      </div>
    )
  }
}

export default withRouter(App)
