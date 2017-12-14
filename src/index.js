import Raven from 'raven-js'
import React from 'react'
import ReactDOM from 'react-dom'
import './main.scss'
import App from './components/App'
import {BrowserRouter as Router} from 'react-router-dom'
import {auto_url_root} from './utils'

const raven_config = {
  release: process.env.REACT_APP_RELEASE,
  tags: {
    host: window.location.host,
  },
  shouldSendCallback: data => {
    // if no culprit this a message and came from socket
    const culprit = data.culprit || '/socket.js'
    const should_send = culprit.indexOf('/socket.js') > 0
    console.debug('sending raven error', should_send, data)
    return should_send
  }
}
Raven.config(process.env.REACT_APP_RAVEN_DSN, raven_config).install()

// TODO these need a consist prefix
const STRINGS = {
  skills_label: 'Skills',
  contractor_enquiry: 'Please enter your details below to enquire about tutoring with {contractor_name}.',
  enquiry: 'Please enter your details below and we will get in touch with you shortly.',
  contractor_enquiry_button: 'Contact {contractor_name}',
  contractor_details_button: 'Show Profile',
  submit_enquiry: 'Submit Enquiry',
  enquiry_submitted_thanks: 'Enquiry submitted, thank you.',
  enquiry_modal_submitted_thanks: 'Enquiry submitted, thank you.\n\nYou can now close this window.',
  enquiry_button: 'Get in touch',
  enquiry_title: 'Enquiry',
  grecaptcha_missing: 'This captcha is required',
  required: ' (Required)',
  subject_filter: 'Filter by subject',
  subject_filter_summary_single: '{subject}: showing 1 result',
  subject_filter_summary_plural: '{subject}: showing {count} results',
}

const MODES = ['grid', 'enquiry', 'enquiry-modal']
const ROUTER_MODES = ['hash', 'history']

window.socket = function (public_key, config) {
  config = config || {}
  Raven.setExtraContext({
    public_key: public_key,
    config: config,
  })

  if (!config.console) {
    config.console = console
    if (!window.localStorage.tcs_enable_debug) {
      if (!window.tcs_debug_log) {
        window.tcs_debug_log = []
      }
      console.debug = function () {
        window.tcs_debug_log.push(Array.from(arguments).join())
      }
    }
  }

  let error = null
  if (!config.mode) {
    config.mode = 'grid'
  } else if (MODES.indexOf(config.mode) === -1) {
    error = `invalid mode "${config.mode}", options are: ${MODES.join(', ')}`
    config.mode = 'grid'
  }
  if (!config.api_root) {
    config.api_root = process.env.REACT_APP_SOCKET_API_URL
  }

  if (!config.url_root) {
    config.url_root = 'auto'
  } else if (config.url_root !== 'auto' && config.url_root[0] !== '/') {
    config.url_root = '/'
    error = 'the "url_root" config parameter should start (and probably end) with a slash "/"'
  }

  if (config.url_root === 'auto') {
    config.url_root = auto_url_root(window.location.pathname)
    console.debug('auto generated url root:', config.url_root)
  }

  if (!config.router_mode) {
    // use history mode with enquiry so it doesn't add the hash
    config.router_mode = config.mode === 'enquiry' ? 'history' : 'hash'
  } else if (ROUTER_MODES.indexOf(config.router_mode) === -1) {
    error = `invalid router mode "${config.router_mode}", options are: ${ROUTER_MODES.join(', ')}`
    config.router_mode = 'hash'
  }

  if (!config.element) {
    config.element = '#socket'
  }

  if (config.subject_filter === undefined) {
    config.subject_filter = true
  }

  if (!config.event_callback) {
    config.event_callback = () => null
  }

  const el = document.querySelector(config.element)
  if (el === null) {
    config.console.error(`SOCKET: page element "${config.element}" does not exist, unable to start socket view.`)
    return
  }

  config.messages = config.messages || {}
  for (let k of Object.keys(STRINGS)) {
    if (!config.messages[k]) {
      config.messages[k] = STRINGS[k]
    }
  }
  config.random_id = Math.random().toString(36).substring(2, 10)
  config.grecaptcha_key = process.env.REACT_APP_GRECAPTCHA_KEY

  console.debug('using config:', config)

  const v = ReactDOM.render(<Router><App error={error} public_key={public_key} config={config}/></Router>, el)
  // TODO provide a better object here?

  window._tcs_grecaptcha_loaded = () => (
    document.dispatchEvent(new Event('_tcs_grecaptcha_loaded'))
  )
  return v
}
