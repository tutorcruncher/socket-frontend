import React, { Component } from 'react'

const GeneralInput = ({field, name, value, field_label, on_change}) => (
  <input type={field.type}
         name={name}
         placeholder={field_label}
         required={field.required}
         maxLength={field.max_length || 255}
         value={value}
         onChange={on_change}/>
)

const TextInput = ({field, name, value, field_label, on_change}) => (
  field.max_length > 500 ? (
    <textarea name={name}
            placeholder={field_label}
            required={field.required}
            maxLength={field.max_length || 255}
            value={value}
            onChange={on_change}
            rows="5"/>
  ) : (
    <GeneralInput field={field} name={name} value={value} field_label={field_label} on_change={on_change}/>
  )
)

const Checkbox = ({field, name, value, field_label, on_change}) => (
  <label>
    <input type="checkbox"
           name={name}
           required={field.required}
           checked={value}
           onChange={on_change}/>
    {field_label}
  </label>
)

const Select = ({field, name, value, field_label, on_change}) => (
  <label>
    {field_label}
    <select name={name} required={field.required} value={value} onChange={on_change}>
      <option value="">---------</option>
      {field.choices && field.choices.map((choice, i) => (
        <option key={i} value={choice.value}>
          {choice.display_name}
        </option>
      ))}
    </select>
  </label>
)

const DateInput = ({field, name, value, field_label, on_change}) => (
  <label>
    {field_label}
    <GeneralInput field={field} name={name} value={value} field_label={field_label} on_change={on_change}/>
  </label>
)

const DatetimeInput = ({field, name, value, field_label, on_change}) => {
  // could use https://stackoverflow.com/a/31162426/949890
  const re_match = value.match(/(.*?)T(.*)/)
  const render_values = {
    date: re_match ? re_match[1] : '',
    time: re_match ? re_match[2] : '',
  }

  const on_change_ = (event) => {
    render_values[event.target.getAttribute('type')] = event.target.value
    on_change({target: {value: render_values.date + 'T' + render_values.time}})
  }
  const required = field.required || render_values.date !== '' || render_values.time !== ''
  return (
    <label>
      {field_label}
      <div>
        <input type="date"
               className="tcs-datetime tcs-date"
               name={name + '-date'}
               required={required}
               value={render_values.date}
               onChange={on_change_}/>
        <input type="time"
               className="tcs-datetime tcs-time"
               step="300"
               name={name + '-time'}
               required={required}
               value={render_values.time}
               onChange={on_change_}/>
      </div>
    </label>
  )
}

const IntegerInput = ({field, name, value, field_label, on_change}) => (
  <input type="number"
         step="1"
         name={name}
         placeholder={field_label}
         required={field.required}
         value={value}
         onChange={on_change}/>
)

const INPUT_LOOKUP = {
  'text': TextInput,
  'checkbox': Checkbox,
  'select': Select,
  'date': DateInput,
  'datetime': DatetimeInput,
  'integer': IntegerInput,
}

class Input extends Component {
  constructor (props) {
    super(props)
    this.on_change = this.on_change.bind(this)
  }

  on_change (event) {
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
    let field_label = field.label
    field_label += field.required && field.type !== 'checkbox' ? this.props.get_text('required') : ''
    const name = field.prefix ? field.prefix + '-' + field.field : field.field
    let value
    if (field.prefix) {
      value = (this.props.enquiry_data[field.prefix] || {})[field.field] || ''
    } else {
      value = this.props.enquiry_data[field.field] || ''
    }

    const Input = INPUT_LOOKUP[field.type] || GeneralInput

    return (
      <div className="tcs-field" id={'field-' + name}>
        <Input field={field} name={name} value={value} field_label={field_label} on_change={this.on_change}/>
        <div className={field.help_class || ('help-text' + (field.prefix ? '' : ' muted'))}>
          {this.props.children || field.help_text}
        </div>
      </div>
    )
  }
}

export default Input
