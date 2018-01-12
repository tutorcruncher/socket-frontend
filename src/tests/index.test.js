import '../index'
import { xhr_setup } from './utils'

beforeEach(() => {
  xhr_setup()
})

it('renders grid', () => {
  const div = document.createElement('div')
  div.setAttribute('id', 'socket')
  document.body.appendChild(div)
  const r = window.socket('good')
  expect(r.goto).toBeTruthy()
  expect(r.config.contractor_filter).toEqual({})
  expect(div.querySelectorAll('.tcs-contractors').length).toBe(1)
  // console.log(pretty_html(div.innerHTML))
})


it('converts contractor filter', () => {
  const div = document.createElement('div')
  div.setAttribute('id', 'socket')
  document.body.appendChild(div)
  const r = window.socket('good', {
    router_mode: 'history',
    mode: 'grid',
    labels_include: ['foobar'],
    labels_exclude: ['spam'],
    event_callback: () => null,
  })
  expect(r.goto).toBeTruthy()
  expect(r.config.contractor_filter).toEqual({
    'label': ['foobar'],
    'label_exclude': ['spam'],
  })
})
