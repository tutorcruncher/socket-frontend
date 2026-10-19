import React, { Component } from 'react'
import {add_script} from '../../utils'
import {IfElse, If, Markdown} from './Tools'
import Input from './Input'

// Messages from socket-server's 400 details: a list of pydantic errors, or TutorCruncher's errors keyed by field
export const error_details = (details, labels) => {
  const label = name => labels[name] || name
  if (Array.isArray(details)) {
    return details.map(d => `${label(d.loc[d.loc.length - 1])}: ${d.msg}`)
  } else if (details && typeof details === 'object') {
    return [].concat(...Object.entries(details).map(([name, value]) => {
      if (Array.isArray(value)) {
        return value.map(msg => `${label(name)}: ${msg}`)
      } else if (value && typeof value === 'object') {
        return error_details(value, labels)
      } else {
        return [`${label(name)}: ${value}`]
      }
    }))
  } else {
    return []
  }
}

class EnquiryForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      submitted: false,
      error: null,
      grecaptcha_missing: false,
      enquiry_data: {},
    }
    if (!this.props.mode) {
      throw Error('Enquiry form mode not set')
    }
    this.grecaptcha_container_id = 'grecaptcha_' + this.props.config.random_id
    this.render_grecaptcha = this.render_grecaptcha.bind(this)
    this.submit = this.submit.bind(this)
    this.set_enquiry_data = this.set_enquiry_data.bind(this)
  }

  componentDidMount () {
    if (this.props.mode !== 'vanilla') {
      this.props.root.ga_event('enquiry-form', 'loaded', this.props.mode)
    }

    if (this.props.config.grecaptcha_key === null) {
      this.props.config.grecaptcha_callback('-')

    } else if (window.grecaptcha === undefined) {
      add_script('https://www.google.com/recaptcha/api.js?onload=_tcs_grecaptcha_loaded&render=explicit')
      document.addEventListener('_tcs_grecaptcha_loaded', () => this.render_grecaptcha(), false)
    } else {
      setTimeout(this.render_grecaptcha, 50)
    }
  }

  async submit (e) {
    e.preventDefault()
    if (!this.state.enquiry_data.grecaptcha_response) {
      this.setState({grecaptcha_missing: true})
      return
    }

    const data = Object.assign({}, this.state.enquiry_data)
    data.upstream_http_referrer = document.referrer
    if (this.props.contractor) {
      data.contractor = this.props.contractor.id
    }

    const r = await this.props.root.requests.post('enquiry', data, {expected_statuses: [201, 400, 502]})
    if (r.status === 201) {
      this.props.root.ga_event('enquiry-form', 'submitted', this.props.mode)
      this.setState({submitted: true})
      this.props.config.event_callback('enquiry_submitted', {mode: this.props.mode, data})
    } else {
      console.warn('Enquiry not submitted:', r)
      this.reset_grecaptcha()
      this.setState({error: this.get_error(r)})
    }
  }

  get_error (r) {
    const get_text = this.props.config.get_text
    if (r.status === 502) {
      return {message: get_text('enquiry_not_submitted'), details: []}
    } else if (r.data.status === 'invalid reCAPTCHA') {
      return {message: get_text('grecaptcha_failed'), details: []}
    } else {
      const labels = {}
      for (let field of this.props.root.get_enquiry().visible || []) {
        labels[field.field] = field.label
      }
      return {message: get_text('enquiry_invalid'), details: error_details(r.data.details, labels)}
    }
  }

  reset_grecaptcha () {
    // a captcha response can only be checked once, so another submit needs a new one
    if (this.grecaptcha_widget_id !== undefined) {
      window.grecaptcha.reset(this.grecaptcha_widget_id)
      this.set_enquiry_data('grecaptcha_response', null)
    }
  }

  render_grecaptcha () {
    const el = document.getElementById(this.grecaptcha_container_id)
    if (el) {
      if (el.childElementCount > 0) {
        console.debug(`${this.grecaptcha_container_id} already has a grecaptcha, not rendering`, el)
      } else {
        console.debug('rendering grecaptcha')
        this.grecaptcha_widget_id = window.grecaptcha.render(this.grecaptcha_container_id, {
          sitekey: this.props.config.grecaptcha_key,
          callback: response => this.set_enquiry_data('grecaptcha_response', response)
        })
      }
    } else {
      console.warn(`${this.grecaptcha_container_id} doesn't exist, not rendering`, el)
    }
  }

  set_enquiry_data (name, value) {
    const enq_data = Object.assign({}, this.state.enquiry_data)
    enq_data[name] = value
    this.setState({enquiry_data: enq_data})
  }

  render () {
    const enquiry_form_info = this.props.root.get_enquiry()
    const visible_fields = enquiry_form_info.visible ? enquiry_form_info.visible : []
    const get_text = this.props.config.get_text
    const description = (
      this.props.contractor ?
        get_text('contractor_enquiry', {contractor_name: this.props.contractor.name}) :
        get_text('enquiry', {})
    )
    const terms_field = this.props.config.terms_link && {
      type: 'checkbox',
      field: 'terms_and_conditions',
      label: get_text('terms_title'),
      help_class: 'tcs-terms',
      required: true,
    }
    return (
      <div className="tcs-enquiry">
        <IfElse v={this.state.submitted}>
          <div className="tcs-submitted">
            <Markdown content={
              get_text(this.props.mode.includes('modal')
                ? 'enquiry_modal_submitted_thanks' : 'enquiry_submitted_thanks')
            }/>
          </div>
          {/*else:*/}
          <div>
            <Markdown content={description}/>

            <form className="tcs" onSubmit={this.submit}>
              <If v={this.state.error}>
                <div className="error-msg">
                  {this.state.error && this.state.error.message}
                  <If v={this.state.error && this.state.error.details.length}>
                    <ul>
                      {this.state.error && this.state.error.details.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                  </If>
                </div>
              </If>
              {visible_fields.map((field, i) => (
                <Input key={i}
                       field={field}
                       get_text={get_text}
                       enquiry_data={this.state.enquiry_data}
                       set_enquiry_data={this.set_enquiry_data}/>
              ))}

              {terms_field && <Input key="terms"
                     field={terms_field}
                     get_text={get_text}
                     enquiry_data={this.state.enquiry_data}
                     set_enquiry_data={this.set_enquiry_data}>
                {get_text('terms_help')}&nbsp;
                <a href={this.props.config.terms_link} target="_blank" rel="noopener noreferrer">
                  {get_text('terms_link')}
                </a>.
              </Input>}

              <div id={this.grecaptcha_container_id} className="grecaptcha"/>

              <If v={this.state.grecaptcha_missing}>
                <div className="error-msg">
                  {get_text('grecaptcha_missing')}
                </div>
              </If>

              <div className="tcs-field tcs-submit">
                <button className="tcs-button" type="submit">
                  {get_text('submit_enquiry')}
                </button>
              </div>
            </form>
          </div>

        </IfElse>
      </div>
    )
  }
}

export default EnquiryForm
