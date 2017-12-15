import React, { Component } from 'react'
import { Cross, Footer }  from './Tools'

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
    setTimeout(() => this.props.history.goBack(), 200)
  }

  render () {
    return (
      <div className={'tcs-modal-trans' + (this.state.show ? ' show' : '')}>
        <div className="tcs-modal-mask" onClick={this.close}>
          <div className="tcs-modal" onClick={e => e.stopPropagation()}>
            <div className="tcs-header">
              <h2>{this.props.title}</h2>
              <div className="close" onClick={this.close}>
                <Cross/>
              </div>
            </div>

            {this.props.children}

            <Footer/>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
