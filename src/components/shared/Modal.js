import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Cross, Footer }  from './Tools'

class Modal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: true,
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
      <CSSTransitionGroup
          transitionName="tcs-modal-trans"
          transitionAppear={true}
          transitionAppearTimeout={200}
          transitionEnter={false}
          transitionLeaveTimeout={200}>
        {this.state.show && (
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
        )}
      </CSSTransitionGroup>
    )
  }
}

export default Modal
