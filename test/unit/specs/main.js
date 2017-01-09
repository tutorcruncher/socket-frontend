import socket from 'src/main'

const dft_response = [200, {'Content-Type': 'application/json'}, '[{"name": "Foobars", "slug": "foobar"}]']

describe('main.vue', done => {
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

    const vm = socket({
      element: '#foobar'
    })

    expect(vm.$el.parentNode.attributes['id'].value).to.equal('outer')
    // no time for get_data to be called so wont fail
    expect(vm.contractors).to.be.empty

    setTimeout(() => {
      expect(vm.contractors).to.have.lengthOf(1)
      done()
    }, 50)
  })
})

describe('main.vue', () => {
  let server
  before(() => {
    server = sinon.fakeServer.create()
    server.autoRespond = true
    server.respondWith('/mock_api/contractors.json', dft_response)
  })
  after(() => { server.restore() })

  it('should call get_data', done => {
    let el = document.createElement('div')
    el.setAttribute('id', 'socket')
    document.body.appendChild(el)

    const vm = socket()

    setTimeout(() => {
      expect(vm.contractors).to.deep.equal([{name: 'Foobars', slug: 'foobar'}])
      done()
    }, 50)
  })
})
