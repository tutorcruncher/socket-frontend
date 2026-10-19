import React from 'react'
import EnquiryForm, {error_details} from '../components/shared/EnquiryForm'
import {STRINGS} from './utils'

// jest turns marked's main file, marked.cjs, into its file name, so utils.js can't load (App.test.js fails on it too)
jest.mock('../utils', () => ({to_markdown: t => t, add_script: () => null}))

const visible = [
  {field: 'client_name', type: 'text', label: 'Your name'},
  {field: 'website', type: 'url', prefix: 'attributes', label: 'Website'},
]

const mount_form = response => {
  const post = jest.fn(() => Promise.resolve(response))
  const config = {
    random_id: 'x',
    grecaptcha_key: null,
    grecaptcha_callback: () => null,
    get_text: name => STRINGS[name],
    event_callback: jest.fn(),
  }
  const root = {ga_event: () => null, get_enquiry: () => ({visible}), requests: {post}}
  const wrapper = enz.mount(<EnquiryForm mode="vanilla" config={config} root={root}/>)
  wrapper.instance().set_enquiry_data('grecaptcha_response', 'response-token')
  return {wrapper, post, config}
}

const submit = async wrapper => {
  await wrapper.instance().submit({preventDefault: () => null})
  wrapper.update()
}

it('shows the thanks once the enquiry is submitted', async () => {
  const {wrapper, post, config} = mount_form({status: 201, data: {}})
  await submit(wrapper)
  expect(post.mock.calls[0][2]).toEqual({expected_statuses: [201, 400, 502]})
  expect(wrapper.find('.tcs-submitted').text()).toBe(STRINGS.enquiry_submitted_thanks)
  expect(config.event_callback).toHaveBeenCalled()
})

it("shows TutorCruncher's errors and asks for the captcha again", async () => {
  window.grecaptcha = {reset: jest.fn()}
  const data = {status: 'invalid enquiry', details: {attributes: {website: ['Enter a valid URL.']}}}
  const {wrapper} = mount_form({status: 400, data})
  wrapper.instance().grecaptcha_widget_id = 0
  await submit(wrapper)
  expect(wrapper.find('.tcs-submitted').length).toBe(0)
  expect(wrapper.find('.error-msg').text()).toBe(STRINGS.enquiry_invalid + 'Website: Enter a valid URL.')
  expect(window.grecaptcha.reset).toHaveBeenCalledWith(0)
  expect(wrapper.state('enquiry_data').grecaptcha_response).toBe(null)
  delete window.grecaptcha
})

it('says when the captcha check failed', async () => {
  const {wrapper} = mount_form({status: 400, data: {status: 'invalid reCAPTCHA'}})
  await submit(wrapper)
  expect(wrapper.find('.error-msg').text()).toBe(STRINGS.grecaptcha_failed)
  // there's no captcha widget without a grecaptcha_key, so the response is kept
  expect(wrapper.state('enquiry_data').grecaptcha_response).toBe('response-token')
})

it('says when the enquiry could not be sent', async () => {
  const {wrapper} = mount_form({status: 502, data: {status: 'enquiry not submitted'}})
  await submit(wrapper)
  expect(wrapper.find('.error-msg').text()).toBe(STRINGS.enquiry_not_submitted)
  expect(wrapper.find('.tcs-submitted').length).toBe(0)
})

it('lists the errors from each kind of 400', () => {
  const labels = {client_name: 'Your name', website: 'Website'}
  const pydantic_errors = [{loc: ['website'], msg: 'Enter a valid URL.', type: 'value_error.url'}]
  expect(error_details(pydantic_errors, labels)).toEqual(['Website: Enter a valid URL.'])
  const tc_errors = {client_name: ['This field is required.'], attributes: {age: 'A valid integer is required.'}}
  expect(error_details(tc_errors, labels)).toEqual([
    'Your name: This field is required.',
    'age: A valid integer is required.',
  ])
  expect(error_details(null, labels)).toEqual([])
})
