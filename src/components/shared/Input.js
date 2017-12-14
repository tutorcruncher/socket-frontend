import React, { Component } from 'react'
import { If, Switch } from './Tools'

class Input extends Component {
  constructor (props) {
    super(props)
    this.changed = this.changed.bind(this)
  }

  changed (event) {
    // this.setState({value: event.target.value})
    const field = this.props.field
    const value = field.type === 'checkbox' ? event.target.checked : event.target.value
    if (field.prefix) {
      let obj = this.props.enquiry_data[field.prefix] || {}
      obj[field.field] = value
      this.props.set_enquiry_data(field.prefix, obj)
    } else {
      this.props.set_enquiry_data(field.field, value)
    }
  }

  render () {
    const field = this.props.field
    const field_label = field.label + (field.required ? this.props.get_text('required') : '')
    const name = field.prefix ? field.prefix + '-' + field.field : field.field
    let value
    if (field.prefix) {
      value = (this.props.enquiry_data[field.prefix] || {})[field.field] || ''
    } else {
      value = this.props.enquiry_data[field.field] || ''
    }

    return (
      <div className="tcs-field" id={'field-' + name}>
        <Switch>
          <If v={field.type === 'text' && field.max_length > 500}>
            <textarea name={name}
                      placeholder={field_label}
                      required={field.required}
                      maxLength={field.max_length || 255}
                      value={value}
                      onChange={this.changed}
                      rows="5"/>
          </If>

          <If v={field.type === 'checkbox'}>
            <label>
              <input type="checkbox"
                     name={name}
                     required={field.required}
                     checked={value}
                     onChange={this.changed}/>
              {field_label}
            </label>
          </If>

          <If v={field.type === 'select'}>
            <label>
              {field_label}
              <select name={name} required={field.required} value={value} onChange={this.changed}>
                <option value="">---------</option>
                {field.choices && field.choices.map((choice, i) => (
                  <option key={i} value={choice.value}>
                    {choice.display_name}
                  </option>
                ))}
              </select>
            </label>
          </If>

          <input type={field.type}
                 name={name}
                 placeholder={field_label}
                 required={field.required}
                 maxLength={field.max_length || 255}
                 value={value}
                 onChange={this.changed}/>
        </Switch>
        <div className={'help-text' + (field.prefix ? '' : ' muted')}>
          {field.help_text}
        </div>
      </div>
    )
  }
}

export default Input
