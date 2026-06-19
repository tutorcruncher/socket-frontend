import React from 'react'
import Error from '../components/shared/Error'

const APPOINTMENTS_URL = 'https://help.tutorcruncher.com/en/articles/14182713-online-lesson-booking-socket'
const DEFAULT_URL = 'https://help.tutorcruncher.com/en/articles/8255881-getting-started-with-tutorcruncher-socket'

it('links to the lesson-booking article for appointments mode', () => {
  const wrapper = enz.shallow(<Error mode="appointments">whatever</Error>)
  const link = wrapper.find('a')
  expect(link.prop('href')).toBe(APPOINTMENTS_URL)
  expect(link.text()).toBe(APPOINTMENTS_URL)
})

it('links to the generic article for grid mode', () => {
  const wrapper = enz.shallow(<Error mode="grid">whatever</Error>)
  const link = wrapper.find('a')
  expect(link.prop('href')).toBe(DEFAULT_URL)
  expect(link.text()).toBe(DEFAULT_URL)
})

it('links to the generic article for list mode', () => {
  const wrapper = enz.shallow(<Error mode="list">whatever</Error>)
  expect(wrapper.find('a').prop('href')).toBe(DEFAULT_URL)
})

it('links to the generic article for enquiry mode', () => {
  const wrapper = enz.shallow(<Error mode="enquiry">whatever</Error>)
  expect(wrapper.find('a').prop('href')).toBe(DEFAULT_URL)
})

it('links to the generic article for an unknown mode', () => {
  const wrapper = enz.shallow(<Error mode="nonsense">whatever</Error>)
  expect(wrapper.find('a').prop('href')).toBe(DEFAULT_URL)
})

it('links to the generic article when mode is undefined (back-compat)', () => {
  const wrapper = enz.shallow(<Error>whatever</Error>)
  expect(wrapper.find('a').prop('href')).toBe(DEFAULT_URL)
})

it('builds a clean https url with no double protocol', () => {
  const wrapper = enz.shallow(<Error mode="appointments">whatever</Error>)
  const href = wrapper.find('a').prop('href')
  expect(href).not.toMatch(/https:\/\/https:\/\//)
  expect(href.match(/https:\/\//g).length).toBe(1)
})

it('preserves target, rel and children', () => {
  const wrapper = enz.shallow(<Error mode="grid">boom</Error>)
  const link = wrapper.find('a')
  expect(link.prop('target')).toBe('_blank')
  expect(link.prop('rel')).toBe('noopener noreferrer')
  expect(wrapper.find('.tcs-error-content').text()).toBe('boom')
})
