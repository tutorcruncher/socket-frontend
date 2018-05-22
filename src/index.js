import Raven from 'raven-js'
import React from 'react'
import ReactDOM from 'react-dom'
import 'babel-polyfill'
import './main.scss'
import App from './components/App'
import {BrowserRouter, HashRouter} from 'react-router-dom'
import {auto_url_root, get_company_options} from './utils'
import {format_money, format_dt, format_duration, get_text, timezone} from './formatting'

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
  subject_filter_placeholder: 'Select a subject...',
  filter_summary_single: 'showing 1 result',
  filter_summary_plural: 'showing {count} results',
  location_input_placeholder: 'Enter your address or zip/postal code...',
  view_profile: 'View Profile',
  review_hours: '({hours} hours)',
  previous: 'Previous',
  next: 'Next',
  no_tutors_found: 'No tutors found.',
  no_tutors_found_loc: 'No more tutors found near "{location}".',
  no_tutors_found_no_loc: 'No more tutors, unable to locate "{location}".',
  no_tutors_found_rate_limited: 'Too many location lookups, no results.',
  distance_away: '{distance}km away',
  book_appointment_button: 'Book Lesson',
  add_to_lesson: 'Add to Lesson',
  diff_minutes: '{minutes} mins',
  diff_1hour: '1 hour',
  diff_1hour_minutes: '1 hour {minutes} mins',
  diff_hours: '{hours} hours',
  diff_hours_minutes: '{hours} hours {minutes} mins',
  spaces: ({ spaces }) => {
    if (spaces === null) {
      return 'Spaces available'
    } else if (spaces === 0) {
      return 'No spaces available'
    } else if (spaces === 1) {
      return '1 space available'
    } else {
      return `${spaces} spaces available`
    }
  },
  spaces_attending: ({ spaces }) => {
    if (spaces === null) {
      return "You're already attending, more spaces available"
    } else if (spaces === 0) {
      return "You're already attending, no more spaces available"
    } else if (spaces === 1) {
      return "You're already attending, 1 more space available"
    } else {
      return `You're already attending, ${spaces} more spaces available`
    }
  },
  add_existing_students: 'Add your existing Students to the lesson',
  add_new_student: 'Add a new Student to the lesson',
  appointment_not_found: 'Appointment not Found',
  appointment_not_found_id: 'No Appointment found with id {apt_id}.',
  price: 'Price',
  job: 'Job',
  start: 'Start',
  finish: 'Finish',
  location: 'Location',
  not_you_sign_out: 'Not you? sign out',
  added: 'Added',
  assuming_timezone: "Times are based off your browser's timezone of {timezone}",
  terms_title: 'Terms and Conditions',
  terms_help: 'I have read and agree to the',
  terms_link: 'terms and conditions',
}

const MODES = ['grid', 'list', 'enquiry', 'enquiry-modal', 'appointments']
const ROUTER_MODES = ['hash', 'history']

window.socket = async function (public_key, config) {
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
  if (config.mode && !MODES.includes(config.mode)) {
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
    if (config.mode === 'enquiry') {
      config.router_mode = 'history'
    }
  } else if (!ROUTER_MODES.includes(config.router_mode)) {
    error = `invalid router mode "${config.router_mode}", options are: ${ROUTER_MODES.join(', ')}`
    config.router_mode = 'hash'
  }

  if (!config.element) {
    config.element = '#socket'
  }

  config.contractor_filter = {}
  if (config.labels_include) {
    config.contractor_filter.label = config.labels_include
    delete config.labels_include
  }
  if (config.labels_exclude) {
    config.contractor_filter.label_exclude = config.labels_exclude
    delete config.labels_exclude
  }

  if (!config.event_callback) {
    config.event_callback = () => null
  }

  config.format = config.format || {
    datetime: 'HH:mm DD/MM/YYYY',
    date: 'DD/MM/YYYY'
  }
  config.timezone = config.timezone || timezone
  config.format_dt = (config.format_dt || format_dt).bind(config)
  config.format_duration = (config.format_duration || format_duration).bind(config)
  config.format_money = (config.format_money || format_money).bind(config)

  const el = document.querySelector(config.element)
  if (el === null) {
    config.console.error(`SOCKET: page element "${config.element}" does not exist, unable to start socket view.`)
    return
  }
  config.messages = Object.assign(Object.assign({}, STRINGS), config.messages || {})
  config.get_text = (config.get_text || get_text).bind(config)
  config.random_id = Math.random().toString(36).substring(2, 10)
  config.grecaptcha_key = process.env.REACT_APP_GRECAPTCHA_KEY

  let company_options
  try {
    company_options = await get_company_options(public_key, config)
  } catch(e) {
    error = e.toString()
    // these are the default values
    company_options = {
      display_mode: 'grid',
      pagination: 100,
      router_mode: 'hash',
      show_hours_reviewed: true,
      show_labels: true,
      show_location_search: true,
      show_stars: true,
      show_subject_filter: true,
      sort_on: 'name',
    }
  }

  company_options.mode = company_options.display_mode
  console.debug('company options:', company_options)
  for (let [k, v] of Object.entries(company_options)) {
    if (config[k] === undefined) {
      config[k] = v
    }
  }

  console.debug('using config:', config)

  const url_base = config.router_mode === 'history' ? config.url_root : '/'
  const url_generator = (url_) => url_base + (url_ || '')

  window._tcs_grecaptcha_loaded = () => (
    document.dispatchEvent(new Event('_tcs_grecaptcha_loaded'))
  )

  const Router = config.router_mode === 'history' ? BrowserRouter : HashRouter

  const router = ReactDOM.render(<Router><App
      error={error}
      public_key={public_key}
      url_generator={url_generator}
      config={config}/></Router>, el)
  // for external use and compatibility with old socket
  return {
    goto: path => {
      if (path === 'enquiry-modal') {
        router.history.push(url_generator('enquiry'))
      } else {
        router.history.push(url_generator(path))
      }
    },
    config: config,
  }
}
