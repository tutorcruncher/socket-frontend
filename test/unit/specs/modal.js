import Vue from 'vue'
import VueRouter from 'vue-router'
import modal from 'src/components/modal'

const vm_data = {
  contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
  config: {contact_html: 'name is: {name}'},
  contractors_extra: {'fred-bloggs': {'extra_attributes': [{'name': 'Bio', 'value': 'I am great'}]}},
}

const generate_vm = (router, vm_data_) => new Vue({
  el: document.createElement('div'),
  router: router,
  render: h => h('router-view'),
  data: vm_data_ || vm_data,
  methods: {
    get_details: () => null,
    get_enquiry: () => null,
    get_text: (name, replacements) => null,
  }
})

describe('modal.vue', () => {
  it('should render contractor details', done => {
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
      expect(vm.$el.querySelector('.tcs-attr h3').textContent).to.equal('Bio')
      expect(vm.$el.querySelector('.tcs-attr p').textContent).to.equal('I am great')
      done()
    })
  })
})

describe('modal.vue', () => {
  it('should close on tcs-modal-mask', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div', {attrs: {'class': 'index'}})}},
        {path: '/:link', name: 'modal', component: modal},
    ]})
    const vm = generate_vm(router)
    router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.attributes['class'].value).to.contain('tcs-modal-mask')
      // this is clicking the background
      vm.$el.click()
      Vue.nextTick(() => {
        expect(vm.$el.attributes['class'].value).to.equal('index')
        done()
      })
    })
  })
})

describe('modal.vue', () => {
  it('should render only five qual levels', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div', {attrs: {'class': 'index'}})}},
        {path: '/:link', name: 'modal', component: modal},
    ]})
    const _vm_data = {
      contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
      config: {contact_html: 'name is: {name}'},
      contractors_extra: {
        'fred-bloggs': {
          extra_attributes: [{'name': 'Bio', 'value': 'I am great'}],
          skills: [
            {
              subject: 'Biology',
              category: 'Science',
              qual_levels: ['GCSE', 'AS Level', 'A Level']
            },
            {
              subject: 'Physics',
              category: 'Science',
              qual_levels: ['QL1', 'QL2', 'QL3', 'QL4', 'QL5', 'QL6']
            },
          ]
        },
      }
    }

    const vm = generate_vm(router, _vm_data)
    router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.include('GCSE')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.include('AS Level')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.include('QL1')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.include('QL2')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.not.include('QL3')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.not.include('QL4')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.include('QL5')
      expect(vm.$el.querySelector('.tcs-skills').textContent).to.include('QL6')
      done()
    })
  })
})

describe('modal.vue', () => {
  it('should render markdown', done => {
    Vue.use(VueRouter)
    const router = new VueRouter({routes: [
        {path: '/', name: 'index', component: {render: h => h('div', {attrs: {'class': 'index'}})}},
        {path: '/:link', name: 'modal', component: modal},
    ]})
    const _vm_data = {
      contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
      config: {contact_html: 'name is: {name}'},
      contractors_extra: {
        'fred-bloggs': {
          extra_attributes: [{'name': 'Bio', 'value': 'I am **great**', 'type': 'text_extended'}],
        },
      }
    }

    const vm = generate_vm(router, _vm_data)
    router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-attr').innerHTML).to.include('I am <strong>great</strong>')
      done()
    })
  })
})
