import React, { Component } from 'react'
import {Switch} from './Tools'

class Input extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // value: this.props.field.prefix ? (
      //   (this.props.enquiry_data[this.props.field.prefix] || {})[this.props.field.field] || ''
      // ) : (
      //   this.props.enquiry_data[this.props.field.field] || ''
      // )
      value: null
    }

    this.changed = this.changed.bind(this)
  }

  changed (event) {
    this.setState({value: event.target.value})
    // if (this.props.field.prefix) {
    //   let obj = this.$root.enquiry_data[this.props.field.prefix] || {}
    //   obj[this.props.field.field] = this.props.field.type === 'checkbox' ? event.target.checked : event.target.value
    //   this.$set(this.$root.enquiry_data, this.props.field.prefix, obj)
    //   this.$root.enquiry_data = Object.assign({}, this.$root.enquiry_data)
    // } else {
    //   this.$set(this.$root.enquiry_data, this.props.field.field, event.target.value)
    // }
  }

  render () {
    const field = this.props.field
    const label = field.label + (field.required ? this.props.get_text('required') : '')
    const name = field.prefix ? field.prefix + '-' + field.field : field.field
    console.log(label, name)

    return (
      <div className="tcs-field" id={'field-' + name}>
        <Switch>
          <span if={field.type === 'text' && field.max_length > 500}>
            <textarea name={name}
                      placeholder={label}
                      required={field.required}
                      maxlength={field.max_length || 255}
                      value={this.state.value}
                      onChange={this.changed}
                      rows="5"/>
          </span>

          <label elseif={field.type === 'checkbox'}>
            <input type="checkbox"
                   name={name}
                   required={field.required}
                   checked={this.state.value}
                   onChange={this.changed}/>
            {label}
          </label>

          <label elseif={field.type === 'select'}>
            {{ label }}
            <select name={name} required={field.required} checked={this.state.value} onChange={this.changed}>
              <option value="">---------</option>
              {field.choices && field.choices.map((choice, i) => (
                <option key={i} value={choice.value} selected={choice.value === this.state.value}>
                  {choice.display_name}
                </option>
              ))}
            </select>
          </label>

          <input type={field.type}
                 name={name}
                 placeholder={label}
                 required={field.required}
                 maxlength={field.max_length || 255}
                 value={this.state.value}
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
