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
      path: '/',
      name: 'index',
      component: grid,
      children: [
        {
          path: '/:slug',
          name: 'modal',
          component: modal,
        }
      ]
    },
  ]
})

module.exports = function (config) {
  config = config || {}

  if (config.root_url === undefined) {
    config.root_url = process.env.SOCKET_API_URL
  }

  if (config.element === undefined) {
    config.element = '#socket'
  }

  if (config.router_mode === undefined) {
    config.router_mode = 'hash'
  }

  if (config.contact_html === undefined) {
    config.contact_html = 'To request tutoring from {name} please <a href="{contact_link}">get in touch</a> with us.'
  }

  if (config.contact_link === undefined) {
    config.contact_link = '/contact'
  }

  if (config.skills_label === undefined) {
    config.skills_label = 'Skills'
  }

  return new Vue({
    el: config.element,
    router: ConfiguredVueRouter(config),
    render: h => h(app),
    data: {
      contractors: [],
      config: config,
      error: null,
    },
    components: {
      app
    },
    methods: {
      // get_data is called by components, eg. grid
      get_data: function () {
        let xhr = new window.XMLHttpRequest()
        let url = config.root_url + '/contractors.json'
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
            contractors.forEach(con => {
              this.contractors.push(con)
            })
          } catch (e) {
            this.error = `\
${e.toString()}
requested url:   "${url}"
response status: ${xhr.status}

response text:
${xhr.responseText}`
            Raven.captureException(new Error(this.error))
          }
        }
        xhr.send()
      }
    }
  })
}
