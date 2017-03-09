import socket from 'src/main'
import {dft_response, TestConsole, enquiry_options, sleep} from './_shared'

describe('main.js', done => {
  let server
  before(() => {
    server = sinon.fakeServer.create()
    server.autoRespond = true
    server.respondWith(dft_response)
  })
  after(() => { server.restore() })

  it('should initialise with different element name', done => {
    let outer = document.createElement('div')
    outer.setAttribute('id', 'outer')
    document.body.appendChild(outer)
    let el = document.createElement('div')
    el.setAttribute('id', 'foobar')
    outer.appendChild(el)

    const vm = socket('public_key', {
      element: '#foobar',
      url_root: '/'
    })
    vm.enquiry_form_info = 'foobar'  // prevent get_enquiry making a GET request
    expect(vm.$el.parentNode.attributes['id'].value).to.equal('outer')
    // no time for get_data to be called so should be empty
    expect(vm.contractors).to.have.lengthOf(0)

    setTimeout(() => {
      expect(vm.contractors).to.have.lengthOf(1)
      done()
    }, 50)
  })

  it('should initialise in grid mode', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)
    const vm = socket('public_key', {url_root: '/'})
    vm.enquiry_form_info = 'foobar'  // prevent get_enquiry making a GET request
    vm.contractors = [{}]
    expect(vm.$el.querySelectorAll('.tcs-grid')).to.have.lengthOf(1)
    expect(vm.$el.querySelectorAll('.tcs-enquiry')).to.have.lengthOf(0)
    expect(vm.$el.querySelectorAll('.tcs-enquiry-button')).to.have.lengthOf(0)
  })

  it('should initialise in enquiry mode', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)
    const vm = socket('public_key', {mode: 'enquiry', url_root: '/'})
    vm.enquiry_form_info = 'foobar'
    vm.contractors = [{}]
    expect(vm.$el.querySelectorAll('.tcs-grid')).to.have.lengthOf(0)
    expect(vm.$el.querySelectorAll('.tcs-enquiry')).to.have.lengthOf(1)
    expect(vm.$el.querySelectorAll('.tcs-enquiry-button')).to.have.lengthOf(0)
  })

  it('should initialise in enquiry-modal mode', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)
    const vm = socket('public_key', {mode: 'enquiry-modal', url_root: '/'})
    vm.enquiry_form_info = 'foobar'
    vm.contractors = [{}]
    expect(vm.$el.querySelectorAll('.tcs-grid')).to.have.lengthOf(0)
    expect(vm.$el.querySelectorAll('.tcs-enquiry')).to.have.lengthOf(0)
    expect(vm.$el.querySelectorAll('.tcs-enquiry-button')).to.have.lengthOf(1)
  })

  it('should use window.location.pathname for url_root', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)
    const vm = socket('public_key')
    vm.enquiry_form_info = 'foobar'
    vm.contractors = [{}]
    expect(vm.config.url_root).to.equal('/context.html')
  })
})

describe('main.js', () => {
  let server
  before(() => {
    server = sinon.fakeServer.create()
    server.autoRespond = true
    server.respondWith('/public_key/contractors', dft_response)
    server.respondWith('/public_key/enquiry', dft_response)  // to prevent errors with get_enquiry
  })
  after(() => { server.restore() })

  it('should download contractors', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    const vm = socket('public_key', {url_root: '/'})

    await sleep(50)
    expect(vm.error).to.equal(null)
    expect(vm.contractors).to.deep.equal([{name: 'Foobars', link: '123-foobar'}])
  })
})

describe('main.js', () => {
  let server
  before(() => {
    server = sinon.fakeServer.create()
    server.autoRespond = true
    server.respondWith('/public_key/contractors', [404, {}, 'badness'])
    server.respondWith('/public_key/enquiry', dft_response)  // to prevent errors with get_enquiry
  })
  after(() => { server.restore() })

  it('should show error with bad response', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    let test_console = new TestConsole()
    const vm = socket('public_key', {console: test_console, url_root: '/'})

    await sleep(50)
    expect(vm.error).to.not.equal(null)
    expect(vm.error).to.contain('Error: bad response 404')
    expect(vm.error).to.contain('response status: 404')
    expect(vm.error).to.contain('response text:\nbadness')
    expect(vm.error).to.not.contain('Connection error')
    expect(test_console.log_).to.have.lengthOf(0)
    expect(test_console.warning_).to.have.lengthOf(0)
    expect(test_console.error_).to.have.lengthOf(1)
  })
})

describe('main.js', () => {
  it('should show connection error', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    let test_console = new TestConsole()
    const vm = socket('the-public-key', {
      api_root: 'http://localhost:12345678',
      url_root: '/',
      console: test_console,
    })

    await sleep(50)
    expect(vm.error).to.contain('Connection error')
    expect(vm.error).to.contain('response status: 0')
    expect(test_console.error_).to.have.lengthOf(1)
  })
})

describe('main.js', () => {
  let server
  before(() => {
    server = sinon.fakeServer.create()
    server.autoRespond = true
    server.respondWith('/public-key/contractors', dft_response)
    server.respondWith('/public-key/enquiry', [200, {'Content-Type': 'application/json'}, '{"response": "ok"}'])
    server.respondWith('/foobar', [200, {'Content-Type': 'application/json'}, '{"the": "response"}'])
  })
  after(() => { server.restore() })

  it('should get enquiry info', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    const vm = socket('public-key', {url_root: '/'})
    vm.get_enquiry()

    await sleep(50)
    expect(vm.enquiry_form_info).to.deep.equal({response: 'ok'})
  })

  it('should convert text', () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    const vm = socket('public-key', {contractor_enquiry_button: 'Speak to {contractor_name}', url_root: '/'})
    vm.enquiry_form_info = 'x'  // prevent get_enquiry making a GET request
    let text = vm.get_text('skills_label')
    expect(text).to.equal('Skills')
    text = vm.get_text('contractor_enquiry_button', {'contractor_name': 'foobar'})
    expect(text).to.equal('Speak to foobar')
  })

  it('should get contractor details', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    const vm = socket('public-key', {url_root: '/'})
    expect(vm.contractors_extra).to.deep.equal({})
    let v = vm.get_details('/foobar', 'key')
    expect(v).to.equal(true)

    await sleep(50)
    expect(vm.contractors_extra).to.deep.equal({key: {the: 'response'}})
    v = vm.get_details('/foobar', 'key')
    expect(v).to.equal(false)
  })
})

describe('main.js', () => {
  let server
  before(() => {
    server = sinon.fakeServer.create()
    server.autoRespond = true
    server.respondWith('/public-key/contractors', dft_response)
    server.respondWith('/public-key/enquiry',
        [200, {'Content-Type': 'application/json'}, JSON.stringify(enquiry_options)])
    server.respondWith('POST', '/public-key/enquiry', (xhr, id) => {
      let obj = JSON.parse(xhr.requestBody)
      expect(obj).to.deep.equal({first_field: 'foobar', attributes: {foo: 'X'}})
      xhr.respond(201, {'Content-Type': 'application/json'}, '{"response": "ok"}')
    })
  })
  after(() => { server.restore() })

  it('should post enquiry data', async () => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    const vm = socket('public-key', {url_root: '/'})
    vm.get_enquiry()

    await sleep(50)
    vm.enquiry_data = {
      first_field: 'foobar',
      another_field: '',
      attributes: {
        foo: 'X',
        bar: '',
      }
    }
    expect(vm.enquiry_data).to.not.deep.equal({})
    await new Promise((resolve, reject) => {
      let callback = () => {
        expect(vm.enquiry_data).to.deep.equal({})
        resolve()
      }
      vm.submit_enquiry(callback)
    })
  })
})
