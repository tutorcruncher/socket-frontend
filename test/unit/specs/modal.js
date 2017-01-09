import Vue from 'vue'
import VueRouter from 'vue-router'
import modal from 'src/components/modal'

const vm_data = {
  contractors: [{name: 'Fred Bloggs', slug: 'fred-bloggs', tag_line: 'hello'}],
  config: {contact_html: 'name is: {name}'}
}

describe('modal.vue', () => {
  it('should render contractor details', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div')}},
        {path: '/:slug', name: 'modal', component: modal},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: h => h('router-view'),
      data: vm_data
    })
    router.push({name: 'modal', params: {slug: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-aside').textContent).to.equal('hello')
      done()
    })
  })
})

describe('modal.vue', () => {
  it('should closes on modal-mask', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div', {attrs: {'class': 'index'}})}},
        {path: '/:slug', name: 'modal', component: modal},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: h => h('router-view'),
      data: vm_data
    })
    router.push({name: 'modal', params: {slug: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.attributes['class'].value).to.equal('modal-mask')
      // this is clicking the background
      vm.$el.click()
      Vue.nextTick(() => {
        expect(vm.$el.attributes['class'].value).to.equal('index')
        done()
      })
    })
  })
})
