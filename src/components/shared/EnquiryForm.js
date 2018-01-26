import React, { Component } from 'react'
import {add_script} from '../../utils'
import {IfElse, If, Markdown} from './Tools'
import Input from './Input'

class EnquiryForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      submitted: false,
      error: false,
      grecaptcha_missing: false,
      enquiry_data: {},
    }
    this.mode = this.props.mode || 'vanilla'
    this.grecaptcha_container_id = 'grecaptcha_' + this.props.config.random_id
    this.render_grecaptcha = this.render_grecaptcha.bind(this)
    this.submit = this.submit.bind(this)
    this.set_enquiry_data = this.set_enquiry_data.bind(this)
  }

  componentDidMount () {
    if (this.mode !== 'vanilla') {
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

    const enquiry_form_info = this.props.root.get_enquiry()
    const data = Object.assign(enquiry_form_info.hidden, this.state.enquiry_data)
    data.upstream_http_referrer = document.referrer
    if (this.props.contractor) {
      data.contractor = this.props.contractor.id
    }

    const r = await this.props.root.requests.post('enquiry', this.state.enquiry_data, [201, 400])
    if (r.status === 201) {
      this.props.root.ga_event('enquiry-form', 'submitted', this.mode)
      this.setState({submitted: true})
    } else {
      console.warn('Invalid form:', r)
      this.setState({error: true})
    }
  }

  render_grecaptcha () {
    const el = document.getElementById(this.grecaptcha_container_id)
    if (el && el.childElementCount === 0) {
      console.debug('rendering grecaptcha')
      window.grecaptcha.render(this.grecaptcha_container_id, {
        sitekey: this.props.config.grecaptcha_key,
        callback: response => this.set_enquiry_data('grecaptcha_response', response)
      })
    } else {
      console.warn('not rendering grecaptcha', el)
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
    const get_text = this.props.root.get_text
    const description = (
      this.props.contractor ?
        get_text('contractor_enquiry', {contractor_name: this.props.contractor.name}) :
        get_text('enquiry', {})
    )
    return (
      <div className="tcs-enquiry">
        <IfElse v={this.state.submitted}>
          <div className="tcs-submitted" v-if="submitted">
            <Markdown content={
              get_text(this.mode.includes('modal') ? 'enquiry_modal_submitted_thanks' : 'enquiry_submitted_thanks')
            }/>
          </div>
          {/*else:*/}
          <div>
            <Markdown content={description}/>

            <form className="tcs" onSubmit={this.submit}>
              <If v={this.state.error}>
                <div className="error-msg">Enquiry form invalid</div>
              </If>
              {visible_fields.map((field, i) => (
                <Input key={i}
                       field={field}
                       get_text={get_text}
                       enquiry_data={this.state.enquiry_data}
                       set_enquiry_data={this.set_enquiry_data}/>
              ))}

              <div id={this.grecaptcha_container_id} className="grecaptcha"/>

              <If v={this.state.grecaptcha_missing}>
                <div className="error-msg">
                  {this.props.root.get_text('grecaptcha_missing')}
                </div>
              </If>

              <div className="tcs-field tcs-submit">
                <button className="tcs-button" type="submit">
                  {this.props.root.get_text('submit_enquiry')}
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
