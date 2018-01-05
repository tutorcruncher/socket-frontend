import '../index'

it('renders grid', () => {
  const div = document.createElement('div')
  div.setAttribute('id', 'socket')
  document.body.appendChild(div)
  window.localStorage = {}
  const r = window.socket('good')
  expect(r.goto).toBeTruthy()
  expect(div.querySelectorAll('.tcs-grid').length).toBe(1)
  // console.log(pretty_html(div.innerHTML))
})
