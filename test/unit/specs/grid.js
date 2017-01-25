import Vue from 'vue'
import VueRouter from 'vue-router'
import grid from 'src/components/grid'

describe('grid.vue', () => {
  it('should render contractors', () => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/:link', name: 'modal', component: {render: h => '-'}},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: (h) => h(grid),
      data: {
        contractors: []
      },
      methods: {
        get_list: function () {
          this.contractors.push({name: 'Fred Bloggs', link: 'fred-bloggs', photo: 'http://path/to/img.jpg'})
        }
      }
    })
    expect(vm.$el.querySelector('h3').textContent).to.equal('Fred Bloggs')
    expect(vm.$el.querySelector('a').attributes['href'].value).to.equal('#/fred-bloggs')
    expect(vm.$el.querySelector('img').attributes['src'].value).to.equal('http://path/to/img.jpg')
  })
})
