import Vue from 'vue'
import VueRouter from 'vue-router'
import modal from 'src/components/modal'

describe('modal.vue', () => {
  it('should render contractor details', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => '-'}},
        {path: '/:slug', name: 'modal', component: modal},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: h => h('router-view'),
      data: {
        contractors: [{name: 'Fred Bloggs', slug: 'fred-bloggs', tag_line: 'hello'}]
      }
    })
    router.push({name: 'modal', params: {slug: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-aside').textContent).to.equal('hello')
      done()
    })
  })
})
