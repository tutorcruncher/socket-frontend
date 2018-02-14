import React, { Component } from 'react'
import {withRouter} from 'react-router-dom'
import {google_analytics, requests, async_start} from '../utils'
import Error from './shared/Error'
import Contractors from './contractors/Contractors'
import PlainEnquiry from './enquiry/PlainEnquiry'
import EnquiryButton from './enquiry/EnquiryButton'

class App extends Component {
  constructor (props) {
    super(props)
    this.ga_prefixes = google_analytics(props.history, props.config)
    this.state = {
      error: props.error,
      enquiry_form_info: null,
    }
    this.url = props.url_generator
    this.get_text = this.get_text.bind(this)

    this.get_enquiry = this.get_enquiry.bind(this)
    this.set_enquiry = this.set_enquiry.bind(this)

    this.ga_event = this.ga_event.bind(this)
    this.requests = {
      get: async (...args) => requests.get(this, ...args),
      post: async (...args) => requests.post(this, ...args),
    }
  }


  get_text (name, replacements) {
    let s = this.props.config.messages[name]
    if (!s) {
      console.warn(`not translation found for "${name}"`)
      return name
    }
    for (let [k, v] of Object.entries(replacements || {})) {
      s = s.replace(`{${k}}`, v)
    }
    return s
  }

  get_enquiry () {
    if (this.state.enquiry_form_info === null) {
      async_start(this.set_enquiry)
    }
    return this.state.enquiry_form_info || {}
  }

  async set_enquiry () {
    this.setState({enquiry_form_info: {}})
    const enquiry_form_info = await this.requests.get('enquiry')
    this.props.config.event_callback('get_enquiry_data', enquiry_form_info)
    this.setState({enquiry_form_info})
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
    } else if (this.props.config.mode === 'enquiry') {
      return <PlainEnquiry root={this} config={this.props.config}/>
    } else if (this.props.config.mode === 'enquiry-modal') {
      return <EnquiryButton root={this} config={this.props.config}/>
    } else {
      // grid or list
      return <Contractors root={this} config={this.props.config} history={this.props.history}/>
    }
  }
}

export default withRouter(App)
