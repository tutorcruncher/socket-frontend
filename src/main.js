import Vue from 'vue'
import app from './app'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(app),
  methods: {
    contractors: () => {
      return [
        {
          name: 'anne',
          img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_1.jpg',
        },
        {
          name: 'bob',
          img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/men_2.jpg',
        },
        {
          name: 'charlie',
          img: 'https://s3-eu-west-1.amazonaws.com/tutorcruncher-demo-images/women_1.jpg',
        }
      ]
    }
  },
  components: {
    app
  }
})
