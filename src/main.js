import Vue from 'vue'
import VueRouter from 'vue-router'
import app from './app'
import grid from './components/grid'
import modal from './components/modal'

// TODO: set once we've got a DSN
// import Raven from 'raven-js'
// import RavenVue from 'raven-js/plugins/vue'
// if (process.env.NODE_ENV === 'production') {
//   Raven.config('https://?@sentry.io/?').addPlugin(RavenVue, Vue).install()
// }

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
    config.root_url = ''  // TODO
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
      config: config
    },
    components: {
      app
    },
    methods: {
      // get_data is called by components, eg. grid
      get_data: function () {
        // TODO error reporting, eg. if we get a bad response or invalid json
        let xhr = new window.XMLHttpRequest()
        xhr.open('GET', config.root_url + '/api/contractors.json')
        xhr.onload = () => {
          let contractors = JSON.parse(xhr.responseText)
          this.contractors.splice(0)
          contractors.forEach(con => {
            this.contractors.push(con)
          })
        }
        xhr.send()
      }
    }
  })
}
