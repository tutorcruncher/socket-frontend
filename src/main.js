import Vue from 'vue'
import VueRouter from 'vue-router'
import app from './app'
import grid from './components/grid'
import modal from './components/modal'

Vue.use(VueRouter)

const router = new VueRouter({
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

module.exports = new Vue({
  el: '#app',
  router: router,
  render: h => h(app),
  data: {
    contractors: []
  },
  components: {
    app
  },
  methods: {
    // get_data is called by components, eg. grid
    get_data: function () {
      var xhr = new window.XMLHttpRequest()
      xhr.open('GET', '/mock_api/contractors.json')
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
