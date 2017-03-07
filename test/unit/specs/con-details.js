import Vue from 'vue'
import {generate_vm} from './_shared'

describe('modal.vue', () => {
  it('should close on tcs-modal-mask', done => {
    const vm = generate_vm()
    vm.$router.push({name: 'modal', params: {link: 'fred-bloggs'}})
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

describe('con-details.vue', () => {
  it('should render contractor details', done => {
    const vm = generate_vm()
    vm.$router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-aside').textContent).to.equal('hello')
      expect(vm.$el.querySelector('.tcs-attr h3').textContent).to.equal('Bio')
      expect(vm.$el.querySelector('.tcs-attr p').textContent).to.equal('I am great')
      done()
    })
  })
})

describe('con-details.vue', () => {
  it('should render only five qual levels', done => {
    const _vm_data = {
      contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
      config: {},
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

    const vm = generate_vm(null, _vm_data)
    vm.$router.push({name: 'modal', params: {link: 'fred-bloggs'}})
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

describe('con-details.vue', () => {
  it('should render markdown', done => {
    const _vm_data = {
      contractors: [{name: 'Fred Bloggs', link: 'fred-bloggs', tag_line: 'hello'}],
      config: {},
      contractors_extra: {
        'fred-bloggs': {
          extra_attributes: [{'name': 'Bio', 'value': 'I am **great**', 'type': 'text_extended'}],
        },
      }
    }

    const vm = generate_vm(null, _vm_data)
    vm.$router.push({name: 'modal', params: {link: 'fred-bloggs'}})
    Vue.nextTick(() => {
      expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
      expect(vm.$el.querySelector('.tcs-attr').innerHTML).to.include('I am <strong>great</strong>')
      done()
    })
  })
})
