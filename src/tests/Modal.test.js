import React from 'react'
import Modal from '../components/shared/Modal'

const config = {modal_container: null}
const history = {push: () => null, location: {pathname: '/tutors/123/'}}

const mount_modal = () => enz.mount(
  <Modal history={history} config={config} title='Test'>
    <p className="tcs-test-content">hello</p>
  </Modal>
)

it('locks page scrolling while mounted and restores it on unmount', () => {
  document.body.style.overflow = 'scroll'
  const wrapper = mount_modal()
  expect(document.body.style.overflow).toBe('hidden')
  wrapper.unmount()
  expect(document.body.style.overflow).toBe('scroll')
  document.body.style.overflow = ''
})

it('allows touch scrolling inside the modal but not on the background mask', () => {
  const wrapper = mount_modal()
  const mask = wrapper.find('.tcs-modal-mask').getDOMNode()
  const content = wrapper.find('.tcs-test-content').getDOMNode()

  const inside = new Event('touchmove', {bubbles: true, cancelable: true})
  content.dispatchEvent(inside)
  expect(inside.defaultPrevented).toBe(false)

  const outside = new Event('touchmove', {bubbles: true, cancelable: true})
  mask.dispatchEvent(outside)
  expect(outside.defaultPrevented).toBe(true)

  wrapper.unmount()
  const after = new Event('touchmove', {bubbles: true, cancelable: true})
  mask.dispatchEvent(after)
  expect(after.defaultPrevented).toBe(false)
})
