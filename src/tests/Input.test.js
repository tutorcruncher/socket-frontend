import React from 'react'
import Input from '../components/shared/Input'

const render_input = field => enz.mount(
  <Input field={field} get_text={n => n} enquiry_data={{}} set_enquiry_data={() => null}/>
)

it('limits a Stars field to its min and max', () => {
  const field = {field: 'rating', type: 'integer', label: 'Rating', min_value: 0.0, max_value: 5.0}
  const input = render_input(field).find('input')
  expect(input.prop('type')).toBe('number')
  expect(input.getDOMNode().getAttribute('min')).toBe('0')
  expect(input.getDOMNode().getAttribute('max')).toBe('5')
})

it('leaves a Number field without min and max', () => {
  const field = {field: 'age', type: 'integer', label: 'Age'}
  const input = render_input(field).find('input')
  expect(input.getDOMNode().hasAttribute('min')).toBe(false)
  expect(input.getDOMNode().hasAttribute('max')).toBe(false)
})

it('sends an empty Date and Time when both boxes are cleared', () => {
  const field = {field: 'start', type: 'datetime', label: 'Start', prefix: 'attributes'}
  const set_enquiry_data = jest.fn()
  const wrapper = enz.mount(
    <Input field={field} get_text={n => n} enquiry_data={{attributes: {start: '2026-10-20T'}}}
           set_enquiry_data={set_enquiry_data}/>
  )
  const date = wrapper.find('input[type="date"]')
  date.getDOMNode().value = ''
  date.simulate('change')
  expect(set_enquiry_data).toHaveBeenCalledWith('attributes', {start: ''})
})

it('sends a Date and Time with only the date as date and T', () => {
  const field = {field: 'start', type: 'datetime', label: 'Start', prefix: 'attributes'}
  const set_enquiry_data = jest.fn()
  const wrapper = enz.mount(
    <Input field={field} get_text={n => n} enquiry_data={{attributes: {}}} set_enquiry_data={set_enquiry_data}/>
  )
  const date = wrapper.find('input[type="date"]')
  date.getDOMNode().value = '2026-10-20'
  date.simulate('change')
  expect(set_enquiry_data).toHaveBeenCalledWith('attributes', {start: '2026-10-20T'})
})
