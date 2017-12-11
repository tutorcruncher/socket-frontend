import {auto_url_root} from 'src/utils'

describe('utils.js.auto_url_root', () => {
  it('should remove /enquiry', () => {
    expect(auto_url_root('/foobar/bar/enquiry')).equal('/foobar/bar/')
  })

  it('should not remove /enquiry/', () => {
    expect(auto_url_root('/foobar/bar/enquiry/')).equal('/foobar/bar/enquiry/')
  })

  it('should remove /123-frank-s', () => {
    expect(auto_url_root('/123-frank-s')).equal('/')
  })

  it('should not remove /-frank-s', () => {
    expect(auto_url_root('/-frank-s')).equal('/-frank-s')
  })
})
