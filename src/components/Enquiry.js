import React, { Component } from 'react'
import {add_script} from '../utils'
import {IfElse, If, Markdown} from './Tools'
import Input from './Input'

class Enquiry extends Component {
  constructor (props) {
    super(props)
    this.state = {
      submitted: false,
      grecaptcha_missing: false,
      grecaptcha_response: null,
    }
    this.mode = this.props.mode || 'vanilla'
    this.grecaptcha_container_id = 'grecaptcha_' + this.props.root.random_id
    this.render_grecaptcha = this.render_grecaptcha.bind(this)
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
      this.render_grecaptcha()
    }
  }

  submit () {
    if (window.grecaptcha && !this.$root.enquiry_data.grecaptcha_response) {
      this.grecaptcha_missing = true
      return
    }

    if (this.contractor !== null) {
      this.$set(this.$root.enquiry_data, 'contractor', this.contractor.id)
    }
    this.$set(this.$root.enquiry_data, 'upstream_http_referrer', document.referrer)
    this.$root.submit_enquiry(this.submission_complete)
    this.$root.ga_event('enquiry-form', 'submitted', this.mode)
  }

  render_grecaptcha () {
    const el = document.getElementById(this.grecaptcha_container_id)
    if (el && el.childElementCount === 0) {
      console.debug('rendering grecaptcha')
      console.log(this.props.config)
      window.grecaptcha.render(this.grecaptcha_container_id, {
        sitekey: this.props.config.grecaptcha_key,
        callback: response => this.setState({grecaptcha_response: response})
      })
    } else {
      console.debug('not rendering grecaptcha', el)
    }
  }

  render () {
    const enquiry_form_info = this.props.root.get_enquiry()
    console.log(enquiry_form_info)
    const visible_fields = enquiry_form_info && enquiry_form_info.visible ? enquiry_form_info.visible : []
    // const attribute_fields = this.$root.enquiry_form_info.attributes || []
    const ismodal = this.mode.includes('modal')
    const get_text = this.props.root.get_text
    return (
      <div className="tcs-enquiry">
        <IfElse v={this.state.submitted}>
          <div className="tcs-submitted" v-if="submitted">
            <IfElse v={ismodal}>
              <Markdown content={get_text('enquiry_modal_submitted_thanks', {})}/>
              <Markdown content={get_text('enquiry_submitted_thanks', {})}/>
            </IfElse>
          </div>

          <div>
            <IfElse v={this.props.contractor}>
              <Markdown content={get_text('contractor_enquiry', {contractor_name: this.props.contractor.name})}/>
              <Markdown content={get_text('enquiry', {})}/>
            </IfElse>

            <form className="tcs" onSubmit={e => e.preventDefault()}>
              {visible_fields.map((field, i) => (
                <Input key={i} field={field} get_text={this.props.root.get_text}/>
              ))}

              <div id={this.grecaptcha_container_id} className="grecaptcha"/>

              <If v={this.state.grecaptcha_missing}>
                <div className="error-msg">
                  {this.props.root.get_text('grecaptcha_missing')}
                </div>
              </If>

              <div className="tcs-field tcs-submit">
                <button type="submit">
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

export default Enquiry
