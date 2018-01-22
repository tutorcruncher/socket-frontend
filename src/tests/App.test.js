import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import App from '../components/App'
import { xhr_setup, tick } from './utils'

beforeEach(() => {
  xhr_setup()
})

it('shows tutors', async () => {
  const config = {
    router_mode: 'history',
    api_root: 'https://socket.tutorcruncher.com',
    mode: 'grid',
    messages: {no_tutors_found: 'xx'},
    event_callback: () => null,
  }
  const wrapper = enz.mount(<Router><App config={config} public_key={'good'} url_generator={u => u}/></Router>)
  await tick()
  wrapper.update()
  // console.log(pretty_html(wrapper.html()))
  expect(xhr_calls.length).toBe(2)
  expect(xhr_calls[1]).toEqual({
    method: 'GET',
    url: 'https://socket.tutorcruncher.com/good/contractors',
    args: 'page=1'
  })
  expect(wrapper.find('.tcs-item').length).toBe(2)
})

it('with con filter', async () => {
  const config = {
    router_mode: 'history',
    api_root: 'https://socket.tutorcruncher.com',
    mode: 'grid',
    messages: {no_tutors_found: 'xx'},
    contractor_filter: {
      label: ['foobar'],
      label_exclude: ['spam'],
    },
    event_callback: () => null,
  }
  const wrapper = enz.mount(<Router><App config={config} public_key={'good'} url_generator={u => u}/></Router>)
  await tick()
  wrapper.update()
  expect(xhr_calls.length).toBe(2)
  expect(xhr_calls[1]).toEqual({
    method: 'GET',
    url: 'https://socket.tutorcruncher.com/good/contractors',
    args: 'label=foobar&label_exclude=spam&page=1'
  })
  expect(wrapper.find('.tcs-item').length).toBe(2)
})
