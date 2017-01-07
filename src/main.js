import Vue from 'vue'
import app from './app'
import VueRouter from 'vue-router'
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
    contractors: [
      {
        name: 'Adam',
        slug: 'adam',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_1.jpg',
      },
      {
        name: 'Billy',
        slug: 'bob',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_2.jpg',
      },
      {
        name: 'Charlie C',
        slug: 'charlie',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/women_1.jpg',
      },
      {
        name: 'Denis',
        slug: 'dick',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_3.jpg',
      },
      {
        name: 'Erica',
        slug: 'erica',
        img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/women_2.jpg',
      },
    ],
    show_modal: false
  },
  components: {
    app
  }
})
