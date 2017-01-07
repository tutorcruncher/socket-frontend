import Vue from 'vue'
import app from './app'
import VueRouter from 'vue-router'
import grid from './components/grid'
import modal from './components/modal'

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    name: 'index',
    component: grid,
    children: [
      {
        path: '/:code',
        name: 'modal',
        component: modal,
      }
    ]
  },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for routes: routes
})

/* eslint-disable no-new */
module.exports = new Vue({
  el: '#app',
  router: router,
  render: h => h(app),
  data: {
    contractors: [
      {
        name: 'Adam',
        code: 'adam',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_1.jpg',
      },
      {
        name: 'Billy',
        code: 'bob',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_2.jpg',
      },
      {
        name: 'Charlie C',
        code: 'charlie',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/women_1.jpg',
      },
      {
        name: 'Denis',
        code: 'dick',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_3.jpg',
      },
      {
        name: 'Erica',
        code: 'erica',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/women_2.jpg',
      },
    ],
    show_modal: false
  },
  components: {
    app
  }
})  // .$mount('#app')
