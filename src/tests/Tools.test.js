import React from 'react'
import {DisplayExtraAttrs} from '../components/shared/Tools'

// jest can't load utils.js's `import marked from 'marked'` (App.test.js fails on it too); links don't render Markdown
jest.mock('../utils', () => ({to_markdown: t => t}))

const url_attr = extra => ({name: 'Intro video', type: 'url', machine_name: 'intro_video', ...extra})

it('shows a link with its link text', () => {
  const attrs = [url_attr({value: 'https://example.com/intro', link_text: 'Watch intro video'})]
  const wrapper = enz.mount(<DisplayExtraAttrs extra_attributes={attrs}/>)
  const a = wrapper.find('a')
  expect(a.text()).toBe('Watch intro video')
  expect(a.prop('href')).toBe('https://example.com/intro')
  expect(a.prop('target')).toBe('_blank')
  expect(a.prop('rel')).toBe('noopener noreferrer')
})

it('shows the address without link text', () => {
  const attrs = [
    url_attr({value: 'https://example.com/old'}),
    url_attr({value: 'https://example.com/blank', link_text: ''}),
  ]
  const wrapper = enz.mount(<DisplayExtraAttrs extra_attributes={attrs}/>)
  expect(wrapper.find('a').map(a => a.text())).toEqual(['https://example.com/old', 'https://example.com/blank'])
})

it('shows a value that is not a web address as text', () => {
  const value = 'javascript:alert(1)' // eslint-disable-line no-script-url
  const attrs = [url_attr({value, link_text: 'Watch intro video'})]
  const wrapper = enz.mount(<DisplayExtraAttrs extra_attributes={attrs}/>)
  expect(wrapper.find('a').length).toBe(0)
  expect(wrapper.find('p').text()).toBe(value)
})
