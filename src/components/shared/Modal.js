import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Cross, Footer }  from './Svgs'

class Modal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
    }
    this.mask_ref = React.createRef()
    this.close = this.close.bind(this)
    this.prevent_background_touch = this.prevent_background_touch.bind(this)
  }

  // Page scrolling behind the modal is blocked by "overflow: hidden" on <body> (see componentDidMount).
  // Touch gestures must still scroll the content inside .tcs-modal (otherwise the enquiry form's submit
  // button is unreachable on phones), so only gestures starting on the mask background itself are cancelled.
  prevent_background_touch (e) {
    if (e.target === this.mask_ref.current) {
      e.preventDefault()
    }
  }

  componentDidMount () {
    this.body_overflow_before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // React registers touch events passively, so preventDefault would be ignored; use a native listener.
    if (this.mask_ref.current) {
      this.mask_ref.current.addEventListener('touchmove', this.prevent_background_touch, {passive: false})
    }
    this.show_timeout = setTimeout(() => this.setState({show: true}), 0)
  }

  componentWillUnmount () {
    clearTimeout(this.show_timeout)
    document.body.style.overflow = this.body_overflow_before
    if (this.mask_ref.current) {
      this.mask_ref.current.removeEventListener('touchmove', this.prevent_background_touch)
    }
  }

  close () {
    this.setState({show: false})
    const h = this.props.history
    const next_url = this.props.last_url ? this.props.last_url : h.location.pathname.replace(/\/[^/]+$/, '/')
    setTimeout(() => h.push(next_url), 200)
  }

  render () {
    const flex = this.props.flex !== undefined ? Boolean(this.props.flex) : true
    const modal_content = (
      <div className={'tcs-modal-mask' + (this.state.show ? ' tcs-show' : '')} onClick={this.close} ref={this.mask_ref}>
        <div className="tcs-modal" onClick={e => e.stopPropagation()}>
          <div className="tcs-header">
            <h2 className="tcs-h2">{this.props.title}</h2>
            <div className="tcs-close" onClick={this.close}>
              <Cross/>
            </div>
          </div>

          <div className={`tcs-modal-body${flex ? ' tcs-modal-flex' : ''}`}>
            {this.props.children}
          </div>

          <Footer/>
        </div>
      </div>
    )
    const container_id = this.props.config.modal_container
    if (container_id) {
      return ReactDOM.createPortal(modal_content, document.getElementById(container_id))
    } else {
      return modal_content
    }
  }
}

export default Modal
