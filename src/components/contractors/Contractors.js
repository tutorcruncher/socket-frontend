import React, { Component } from 'react'
import {Route, Switch} from 'react-router-dom'
import {async_start} from '../../utils'
import Grid from './Grid'
import ConModal from './ConModal'

class Contractors extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contractors: [],
      got_contractors: false,
    }
    this.get_contractors = this.get_contractors.bind(this)
    this.get_contractor_details = this.get_contractor_details.bind(this)
    this.set_contractor_details = this.set_contractor_details.bind(this)
  }

  async componentDidMount () {
    await this.get_contractors()
  }

  async get_contractors (subject_id) {
    this.setState({
      contractors: await this.props.root.requests.get('contractors', {subject: subject_id || null}),
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
    this.setState({[state_ref]: await this.props.root.requests.get(url)})
  }

  render () {
    return (
      <div className="tcs-app">
        <Grid config={this.props.config}
              contractors={this.state.contractors}
              get_contractors={this.get_contractors}
              get_text={this.props.root.get_text}
              requests={this.props.root.requests}/>

        <Switch>
          <Route path="/:id([0-9]+):_extra" render={props => (
            <ConModal id={props.match.params.id}
                      contractors={this.state.contractors}
                      got_contractors={this.state.got_contractors}
                      get_contractor_details={this.get_contractor_details}
                      root={this.props.root}
                      config={this.props.config}
                      history={props.history}/>
          )}/>
        </Switch>
      </div>
    )
  }
}

export default Contractors
