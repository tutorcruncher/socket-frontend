import {enquiry_router, modal_enquiry_router, generate_vm, tick, sleep} from './_shared'

describe('con-modal.vue, enquiry.vue', () => {
  it('should render contractor details then form', async () => {
    const vm = generate_vm()
    vm.$router.push({name: 'con-modal', params: {link: '123-fred-bloggs'}})
    await tick()
    expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
    expect(vm.$el.querySelector('.tcs-aside').textContent).to.equal('hello')
    vm.$el.querySelector('.tcs-extra button').click()
    await tick()
    await sleep(50)  // wait for transition
    expect(vm.$el.querySelector('input').attributes['placeholder'].value).to.equal('Foobar')
    expect(vm.$el.querySelector('input').attributes['name'].value).to.equal('.first_field')
    expect(vm.$el.querySelector('textarea').attributes['placeholder'].value).to.equal('Custom Field')
    expect(vm.$el.querySelector('textarea').attributes['name'].value).to.equal('attributes.custom_field')
  })
})

describe('con-modal.vue, enquiry.vue', () => {
  it('should submit form', async () => {
    const vm = generate_vm()
    vm.$router.push({name: 'con-modal', params: {link: '123-fred-bloggs'}})

    await tick()
    expect(vm.$el.querySelector('h2').textContent).to.equal('Fred Bloggs')
    vm.$el.querySelector('.tcs-extra button').click()

    await tick()
    await sleep(50)  // wait for transition
    expect(vm.$el.querySelector('input').attributes['placeholder'].value).to.equal('Foobar')
    expect(vm.$el.querySelector('input').value).to.equal('')
    expect(vm.enquiry_data).to.deep.equal({})
    vm.$el.querySelector('input').value = 'the new value'
    vm.$el.querySelector('input').dispatchEvent(new window.Event('input'))

    vm.$el.querySelector('textarea').value = 'X'
    vm.$el.querySelector('textarea').dispatchEvent(new window.Event('input'))

    await tick()
    expect(vm.$el.querySelector('input').value).to.equal('the new value')
    expect(vm.enquiry_data).to.deep.equal({first_field: 'the new value', attributes: {custom_field: 'X'}})

    expect(vm.method_calls['submit_enquiry']).to.equal(undefined)
    vm.$el.querySelector('form').dispatchEvent(new window.Event('submit'))

    await tick()
    expect(vm.method_calls['submit_enquiry']).to.equal(1)
    expect(vm.enquiry_data).to.deep.equal({})
  })
})

describe('enquiry.vue', () => {
  it('should render simple enquiry form', async () => {
    const vm = generate_vm(enquiry_router)
    vm.$router.push({name: 'index'})

    await tick()
    expect(vm.$el.querySelector('input').attributes['placeholder'].value).to.equal('Foobar')
    expect(vm.$el.querySelector('input').value).to.equal('')
    expect(vm.enquiry_data).to.deep.equal({})
    vm.$el.querySelector('input').value = 'the new value'
    vm.$el.querySelector('input').dispatchEvent(new window.Event('input'))

    await tick()
    expect(vm.$el.querySelector('input').value).to.equal('the new value')
    expect(vm.enquiry_data).to.deep.equal({first_field: 'the new value'})

    expect(vm.method_calls['submit_enquiry']).to.equal(undefined)
    vm.$el.querySelector('form').dispatchEvent(new window.Event('submit'))

    await tick()
    expect(vm.method_calls['submit_enquiry']).to.equal(1)
    expect(vm.enquiry_data).to.deep.equal({})
  })
})

describe('enquiry-modal.vue', () => {
  it('should render modal enquiry form', async () => {
    const vm = generate_vm(modal_enquiry_router)
    vm.$router.push({name: 'enquiry-modal'})
    vm.$router.push({name: 'enquiry-modal'})

    await tick()
    expect(vm.$el.querySelector('input').attributes['placeholder'].value).to.equal('Foobar')
    expect(vm.enquiry_data).to.deep.equal({})
    vm.$el.querySelector('input').value = 'the new value'
    vm.$el.querySelector('input').dispatchEvent(new window.Event('input'))

    await tick()
    expect(vm.enquiry_data).to.deep.equal({first_field: 'the new value'})

    expect(vm.method_calls['submit_enquiry']).to.equal(undefined)
    vm.$el.querySelector('form').dispatchEvent(new window.Event('submit'))

    await tick()
    expect(vm.method_calls['submit_enquiry']).to.equal(1)
    expect(vm.enquiry_data).to.deep.equal({})

    vm.$router.push({name: 'index'})
    await tick()
  })
})
