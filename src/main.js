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
  shouldSendCallback: (data) => {
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
  contractor_enquiry_message: 'Please enter your details below to enquire about tutoring with {contractor_name}.',
  enquiry_message: 'Please enter your details below and we will get in touch with you shortly.',
  contractor_enquiry_button: 'Contact {contractor_name}',
  contractor_details_button: 'Show Profile',
  submit_enquiry: 'Submit Enquiry',
  enquiry_submitted_thanks: 'Enquiry submitted, thank you.',
  enquiry_modal_submitted_thanks: 'Enquiry submitted, thank you.\n\nYou can now close this window.',
  enquiry_button: 'Get in touch',
  grecaptcha_missing: 'This captcha is required',
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
  if (config.mode === undefined) {
    config.mode = 'grid'
  } else if (MODES.indexOf(config.mode) === -1) {
    error = `invalid mode "${config.mode}", options are: ${MODES.join(', ')}`
    config.mode = 'grid'
  }

  if (config.api_root === undefined) {
    config.api_root = process.env.SOCKET_API_URL
  }

  if (config.url_root === undefined) {
    config.url_root = 'auto'
  } else if (config.url_root !== 'auto' && config.url_root[0] !== '/') {
    config.url_root = '/'
    error = 'the "url_root" config parameter should start (and probably end) with a slash "/"'
  }

  if (config.url_root === 'auto') {
    config.url_root = auto_url_root(window.location.pathname)
  }

  if (config.router_mode === undefined) {
    config.router_mode = 'hash'
  } else if (ROUTER_MODES.indexOf(config.router_mode) === -1) {
    error = `invalid router mode "${config.router_mode}", options are: ${ROUTER_MODES.join(', ')}`
    config.router_mode = 'hash'
  }

  if (config.console === undefined) {
    config.console = console
  }

  if (config.element === undefined) {
    config.element = '#socket'
  }

  if (document.querySelector(config.element) === null) {
    config.console.error(`SOCKET: page element "${config.element}" does not exist, unable to start socket view.`)
    return
  }

  for (let k of Object.keys(STRINGS)) {
    if (config[k] === undefined) {
      config[k] = STRINGS[k]
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
      get_list: function () {
        // if an error already exists show that and return
        if (error !== null) {
          return
        }
        const xhr = new window.XMLHttpRequest()
        const url = `${config.api_root}/${public_key}/contractors`
        xhr.open('GET', url)
        xhr.onload = () => {
          let contractors
          try {
            if (xhr.status !== 200) {
              throw new Error(`bad response ${xhr.status} at "${url}"`)
            } else {
              contractors = JSON.parse(xhr.responseText)
            }
            this.contractors.splice(0)
            contractors.forEach(con => this.contractors.push(con))
          } catch (e) {
            this.handle_error(`\
${e.toString()}
requested url:   "${url}"
response status: ${xhr.status}
response text:
${xhr.responseText}`)
          }
        }
        xhr.onerror = () => {
          this.handle_error(`\
Connection error
requested url:   "${url}"
response status: ${xhr.status}
response text:   "${xhr.responseText}"`)
        }
        xhr.send()
      },
      get_details: function (url, link) {
        if (this.contractors_extra[link] !== undefined) {
          return false
        }
        const xhr = new window.XMLHttpRequest()
        xhr.open('GET', url)
        xhr.onload = () => {
          if (xhr.status !== 200) {
            this.handle_error(`bad response ${xhr.status} at "${url}"`)
          } else {
            const con = JSON.parse(xhr.responseText)
            Vue.set(this.contractors_extra, link, con)
          }
        }
        xhr.send()
        return true
      },
      get_enquiry: function () {
        if (Object.keys(this.enquiry_form_info).length !== 0 || this._getting_enquiry_info) {
          return
        }
        const xhr = new window.XMLHttpRequest()
        const url = `${config.api_root}/${public_key}/enquiry`
        xhr.open('GET', url)
        xhr.onload = () => {
          if (xhr.status !== 200) {
            this.handle_error(`\
Connection error
requested url:   "${url}"
response status: ${xhr.status}
response text:   "${xhr.responseText}"`)
          } else {
            this.enquiry_form_info = Object.assign({}, this.enquiry_form_info, JSON.parse(xhr.responseText))
          }
        }
        xhr.send()
      },
      submit_enquiry: function (callback) {
        const data = JSON.stringify(clean(this.enquiry_data))
        const xhr = new window.XMLHttpRequest()
        const url = `${config.api_root}/${public_key}/enquiry`
        xhr.open('POST', url)
        xhr.onload = () => {
          if (xhr.status !== 201) {
            this.handle_error(`\
Connection error
requested url:   "${url}"
response status: ${xhr.status}
response text:   "${xhr.responseText}"`)
          } else {
            this.enquiry_data = {}
            callback()
          }
        }
        xhr.send(data)
      },
      get_text: function (name, replacements, is_markdown) {
        let s = this.config[name]
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
