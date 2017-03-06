import Vue from 'vue'
import VueRouter from 'vue-router'
import modal from 'src/components/modal'
import {generate_vm} from './_shared'

describe('enquiry.vue', () => {
  it('should render contractor details then form', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div')}},
        {path: '/:link', name: 'modal', component: modal},
    ]})
    const vm = generate_vm(router)
    router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-aside').textContent).to.equal('hello')
      vm.$el.querySelector('.tcs-extra button').click()
      Vue.nextTick(() => {
        expect(vm.$el.querySelector('input').attributes['placeholder'].value).to.equal('Foobar')
        expect(vm.$el.querySelector('input').attributes['name'].value).to.equal('.first_field')
        done()
      })
    })
  })
})
