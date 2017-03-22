import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
import app from './app'
import enquiry from './components/enquiry'
import enquiry_button from './components/enquiry-button'
import enquiry_modal from './components/enquiry-modal'
import grid from './components/grid'
import con_modal from './components/con-modal'
import {to_markdown, clean, auto_url_root, init_ga} from './utils'

const raven_config = {
  release: process.env.RELEASE,
  tags: {
    host: window.location.host,
  },
  shouldSendCallback: data => {
    // if no culprit this a message and came from socket
    const culprit = data.culprit || '/socket.js'
    return culprit.indexOf('/socket.js') > 0
  }
}
Raven.config(process.env.RAVEN_DSN, raven_config).addPlugin(RavenVue, Vue).install()

Vue.use(VueRouter)

const ConfiguredVueRouter = config => {
  const routes = []
  if (config.mode === 'grid') {
    routes.push(
      {
        path: config.url_root,
        name: 'index',
        component: grid,
        children: [
          {
            path: config.url_root + ':link(\\d+-[\\w-]+)',
            name: 'con-modal',
            component: con_modal,
          }
        ]
      }
    )
  } else if (config.mode === 'enquiry') {
    routes.push(
      {
        path: config.url_root,
        name: 'index',
        component: enquiry,
      },
    )
  } else if (config.mode === 'enquiry-modal') {
    routes.push(
      {
        path: config.url_root,
        name: 'index',
        component: enquiry_button,
        children: [
          {
            path: config.url_root + 'enquiry',
            name: 'enquiry-modal',
            component: enquiry_modal,
          }
        ]
      }
    )
  }
  return new VueRouter({
    mode: config.router_mode,
    routes: routes
  })
}

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
  grecaptcha_missing: 'This captcha is required',
  required: ' (Required)',
  subject_filter: 'Filter by subject',
}

const MODES = ['grid', 'enquiry', 'enquiry-modal']
const ROUTER_MODES = ['hash', 'history']

module.exports = function (public_key, config) {
  config = config || {}
  Raven.setExtraContext({
    public_key: public_key,
    config: config,
  })

  let error = null
  if (!config.mode) {
    config.mode = 'grid'
  } else if (MODES.indexOf(config.mode) === -1) {
    error = `invalid mode "${config.mode}", options are: ${MODES.join(', ')}`
    config.mode = 'grid'
  }

  if (!config.api_root) {
    config.api_root = process.env.SOCKET_API_URL
  }

  if (!config.url_root) {
    config.url_root = 'auto'
  } else if (config.url_root !== 'auto' && config.url_root[0] !== '/') {
    config.url_root = '/'
    error = 'the "url_root" config parameter should start (and probably end) with a slash "/"'
  }

  if (config.url_root === 'auto') {
    config.url_root = auto_url_root(window.location.pathname)
  }

  if (!config.router_mode) {
    // use history mode with enquiry so it doesn't add the hash
    config.router_mode = config.mode === 'enquiry' ? 'history' : 'hash'
  } else if (ROUTER_MODES.indexOf(config.router_mode) === -1) {
    error = `invalid router mode "${config.router_mode}", options are: ${ROUTER_MODES.join(', ')}`
    config.router_mode = 'hash'
  }

  if (!config.console) {
    config.console = console
  }

  if (!config.element) {
    config.element = '#socket'
  }

  if (document.querySelector(config.element) === null) {
    config.console.error(`SOCKET: page element "${config.element}" does not exist, unable to start socket view.`)
    return
  }

  config.messages = config.messages || {}
  for (let k of Object.keys(STRINGS)) {
    if (!config.messages[k]) {
      config.messages[k] = STRINGS[k]
    }
  }
  const router = ConfiguredVueRouter(config)

  const ga_prefixes = init_ga(router, config)

  return new Vue({
    el: config.element,
    router: router,
    render: h => h(app),
    data: {
      grecaptcha_key: process.env.GRECAPTCHA_KEY,
      contractors: [],
      subjects: [],
      contractors_extra: {},
      config: config,
      error: null,
      public_key: public_key,
      enquiry_form_info: {},
      enquiry_data: {},
    },
    components: {
      app
    },
    created: function () {
      if (error !== null) {
        this.handle_error(error)
      }
    },
    methods: {
      // get_data is called by components, eg. grid
      handle_error: function (error_message) {
        this.error = error_message || 'unknown'
        config.console.error('SOCKET: ' + this.error)
        Raven.captureMessage(this.error, {
          level: 'error',
          fingerprint: ['{{ default }}', public_key],
        })
      },
      request: function (url, callback, method, data) {
        const xhr = new window.XMLHttpRequest()
        xhr.open(method || 'GET', url)
        xhr.setRequestHeader('Accept', 'application/json')
        xhr.onload = () => {
          try {
            callback(xhr)
          } catch (e) {
            this.handle_error(`\
${e.toString()}
requested url:   ${url}
response status: ${xhr.status}
response text:
${xhr.responseText}`)
          }
        }
        xhr.onerror = () => {
          this.handle_error(`\
Connection error
requested url:   ${url}
response status: ${xhr.status}
response text:   
${xhr.responseText}`)
        }
        xhr.send(data || null)
      },
      request_list: function (url, data_property) {
        this.request(url, (xhr) => {
          let items
          if (xhr.status !== 200) {
            throw Error(`bad response status ${xhr.status} not 200`)
          } else {
            items = JSON.parse(xhr.responseText)
          }
          data_property.splice(0)
          items.forEach(con => data_property.push(con))
        })
      },
      get_contractor_list: function (args) {
        // if an error already exists show that and return
        if (error !== null) {
          return
        }
        let url = `${config.api_root}/${public_key}/contractors`
        if (args) {
          const arg_list = []
          for (let [name, value] of Object.entries(args)) {
            arg_list.push(encodeURIComponent(name) + '=' + encodeURIComponent(value))
          }
          url += '?' + arg_list.join('&')
        }
        this.request_list(url, this.contractors)
      },
      get_contractor_details: function (url, link) {
        if (this.contractors_extra[link] !== undefined) {
          return false
        }
        this.request(url, (xhr) => {
          if (xhr.status !== 200) {
            throw Error(`bad response status ${xhr.status} not 200`)
          } else {
            const con = JSON.parse(xhr.responseText)
            Vue.set(this.contractors_extra, link, con)
          }
        })
        return true
      },
      get_enquiry: function () {
        if (Object.keys(this.enquiry_form_info).length !== 0 || this._getting_enquiry_info) {
          return
        }
        this.request(`${config.api_root}/${public_key}/enquiry`, (xhr) => {
          if (xhr.status !== 200) {
            throw Error(`bad response status ${xhr.status} not 200`)
          } else {
            this.enquiry_form_info = Object.assign({}, this.enquiry_form_info, JSON.parse(xhr.responseText))
          }
        })
      },
      submit_enquiry: function (callback) {
        const data = JSON.stringify(clean(this.enquiry_data))
        const request_callback = (xhr) => {
          if (xhr.status !== 201) {
            throw Error(`bad response status ${xhr.status} not 201`)
          } else {
            this.enquiry_data = {}
            callback()
          }
        }
        this.request(`${config.api_root}/${public_key}/enquiry`, request_callback, 'POST', data)
      },
      get_subject_list: function () {
        if (this.subjects.length > 0) {
          return
        }
        this.request_list(`${config.api_root}/${public_key}/subjects`, this.subjects)
      },

      get_text: function (name, replacements, is_markdown) {
        let s = this.config.messages[name]
        for (let [k, v] of Object.entries(replacements || {})) {
          s = s.replace('{' + k + '}', v)
        }
        if (is_markdown === true) {
          return to_markdown(s)
        } else {
          return s
        }
      },
      ga_event: function (category, action, label) {
        /* istanbul ignore next */
        for (let prefix of ga_prefixes) {
          window.ga(prefix + 'send', 'event', category, action, label)
        }
      },
      goto: function (name, params) {
        this.$router.push({'name': name, params: params})
      }
    }
  })
}
