import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
import app from './app'
import grid from './components/grid'
import modal from './components/modal'

let dsn = process.env.NODE_ENV === 'production' && 'https://e8143a1422274f0bbf312ed8792f4e86@sentry.io/128441'
Raven.config(dsn, {release: process.env.RELEASE}).addPlugin(RavenVue, Vue).install()

Vue.use(VueRouter)

const ConfiguredVueRouter = config => new VueRouter({
  mode: config.router_mode,
  routes: [
    {
      path: config.url_root,
      name: 'index',
      component: grid,
      children: [
        {
          path: config.url_root + ':link',
          name: 'modal',
          component: modal,
        }
      ]
    },
  ]
})

const STRINGS = {
  skills_label: 'Skills',
  contractor_enquiry_message: 'Please enter your details below to enquire about tutoring with {contractor_name}.',
  contractor_enquiry_button: 'Contact {contractor_name}',
  contractor_details_button: 'Show Profile',
  submit_enquiry: 'Submit Enquiry'
}

module.exports = function (public_key, config) {
  config = config || {}
  let error = null

  if (config.api_root === undefined) {
    config.api_root = process.env.SOCKET_API_URL
  }

  if (config.url_root === undefined) {
    config.url_root = '/'
  } else if (!config.url_root.startsWith('/')) {
    config.url_root = '/'
    error = 'the "url_root" config parameter should start (and probably end) with a slash "/"'
  }

  if (config.router_mode === undefined) {
    config.router_mode = 'hash'
  }

  if (config.element === undefined) {
    config.element = '#socket'
  }

  if (config.contact_link === undefined) {
    config.contact_link = '/contact'
  }

  for (let k of Object.keys(STRINGS)) {
    if (config[k] === undefined) {
      config[k] = STRINGS[k]
    }
  }

  return new Vue({
    el: config.element,
    router: ConfiguredVueRouter(config),
    render: h => h(app),
    data: {
      contractors: [],
      contractors_extra: {},
      config: config,
      error: null,
      public_key: public_key,
      enquiry_info: null,
    },
    components: {
      app
    },
    methods: {
      // get_data is called by components, eg. grid
      handle_error: function (error_message) {
        this.error = error_message || 'unknown'
        console.error(this.error)
        Raven.captureException(new Error(this.error))
      },
      get_list: function () {
        // if an error already exists show that and return
        if (error !== null) {
          this.handle_error(error)
          return
        }
        let xhr = new window.XMLHttpRequest()
        let url = `${config.api_root}/${public_key}/contractors`
        xhr.open('GET', url)
        xhr.onload = () => {
          let contractors
          try {
            if (xhr.status !== 200) {
              throw new Error(`bad response ${xhr.status}`)
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
          return
        }
        let xhr = new window.XMLHttpRequest()
        xhr.open('GET', url)
        xhr.onload = () => {
          if (xhr.status !== 200) {
            throw new Error(`bad response ${xhr.status}`)
          } else {
            let con = JSON.parse(xhr.responseText)
            Vue.set(this.contractors_extra, link, con)
          }
        }
        xhr.send()
      },
      get_enquiry: function () {
        if (this.enquiry_info !== null) {
          return
        }
        let xhr = new window.XMLHttpRequest()
        xhr.open('GET', `${config.api_root}/${public_key}/enquiry`)
        xhr.onload = () => {
          if (xhr.status !== 200) {
            throw new Error(`bad response ${xhr.status}`)
          } else {
            this.enquiry_info = JSON.parse(xhr.responseText)
          }
        }
        xhr.send()
      },
      get_text: function (key, replace_with) {
        let s = this.config[key]
        for (let [k, v] of Object.entries(replace_with)) {
          s = s.replace('{' + k + '}', v)
        }
        return s
      }
    }
  })
}
