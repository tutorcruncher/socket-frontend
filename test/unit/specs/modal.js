import Vue from 'vue'
import VueRouter from 'vue-router'
import modal from 'src/components/modal'

const vm_data = {
  contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
  config: {contact_html: 'name is: {name}'},
  contractors_extra: {'fred-bloggs': {'extra_attributes': [{'name': 'Bio', 'value': 'I am great'}]}},
}

describe('modal.vue', () => {
  it('should render contractor details', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div')}},
        {path: '/:link', name: 'modal', component: modal},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: h => h('router-view'),
      data: vm_data,
      methods: {get_details: function (url, link) {}}
    })
    router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-aside').textContent).to.equal('hello')
      expect(vm.$el.querySelector('.tcs-attr h3').textContent).to.equal('Bio')
      expect(vm.$el.querySelector('.tcs-attr p').textContent).to.equal('I am great')
      done()
    })
  })
})

describe('modal.vue', () => {
  it('should closes on modal-mask', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div', {attrs: {'class': 'index'}})}},
        {path: '/:link', name: 'modal', component: modal},
    ]})
    const vm = new Vue({
      el: document.createElement('div'),
      router: router,
      render: h => h('router-view'),
      data: vm_data,
      methods: {get_details: function (url, link) {}}
    })
    router.push({name: 'modal', params: {link: 'fred-bloggs'}})
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
