import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import App from '../components/App'
import {tick} from './utils'

it('shows tutors', async () => {
  // expect.assertions(2)
  const config = {
    router_mode: 'history',
    api_root: 'https://socket.tutorcruncher.com',
    mode: 'grid',
    event_callback: () => null,
  }
  const wrapper = enz.mount(<Router><App config={config} public_key={'good'} url_generator={u => u}/></Router>)
  await tick()
  wrapper.update()
  // console.log(pretty_html(wrapper.html()))
  expect(global.XMLHttpRequest.mock.calls.length).toBe(2)
  expect(wrapper.find('.tcs-col').length).toBe(2)
})
