import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import App from '../components/App'

jest.mock('marked', () => ({setOptions: () => null}))

const config = {
  mode: 'appointments',
  router_mode: 'history',
  event_callback: () => null,
}

it('error render uses appointments help link', () => {
  window.ga = () => null
  const wrapper = enz.mount(
    <MemoryRouter>
      <App error="boom" config={config} url_generator={u => u}/>
    </MemoryRouter>
  )
  const link = wrapper.find('a')
  expect(link.prop('href')).toBe('https://help.tutorcruncher.com/en/articles/14182713-online-lesson-booking-socket')
  expect(wrapper.find('.tcs-error-content').text()).toBe('boom')
})
