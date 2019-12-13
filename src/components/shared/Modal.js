import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Cross, Footer }  from './Svgs'

class Modal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
    }
    this.scroll_disabled = false
    this.close = this.close.bind(this)
    this.prevent_scroll = this.prevent_scroll.bind(this)
  }

  prevent_scroll (e) {
    if (!this.scroll_disabled) {
      this.scroll_disabled = true
      document.body.style.overflow = 'hidden'
      e.preventDefault()
    }
  }

  componentWillMount () {
    this.body_overflow_before = document.body.style.overflow
    window.onwheel = this.prevent_scroll
    window.onmousewheel = document.onmousewheel = this.prevent_scroll
    window.ontouchmove  = this.prevent_scroll
    setTimeout(() => this.setState({show: true}), 0)
  }

  componentWillUnmount () {
    document.body.style.overflow = this.body_overflow_before
    window.onwheel = null
    window.onmousewheel = document.onmousewheel = null
    window.ontouchmove  = null
  }

  close () {
    this.setState({show: false})
    const h = this.props.history
    const next_url = this.props.last_url ? this.props.last_url : h.location.pathname.replace(/\/[^/]+$/, '/')
    setTimeout(() => h.push(next_url), 200)
  }

  render () {
    const flex = this.props.flex !== undefined ? Boolean(this.props.flex) : true
    const el = (
      <div className={'tcs-modal-mask' + (this.state.show ? ' tcs-show' : '')} onClick={this.close}>
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
    if (this.props.parent_el) {
      return ReactDOM.createPortal(el, document.getElementById(this.props.parent_el))
    } else {
      return el
    }
  }
}

export default Modal
