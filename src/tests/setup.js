import 'raf/polyfill'
import {configure} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import {shallow, mount, render} from 'enzyme'
import pretty from 'pretty'
import {MockXMLHttpRequest} from './utils'


configure({
  adapter: new Adapter()
})
global.XMLHttpRequest = jest.fn(MockXMLHttpRequest)
global.pretty_html = pretty
global.enz = {
  shallow: shallow,
  render: render,
  mount: mount,
}
