import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Cross, Footer }  from './Tools'

class Modal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: true
    }
    this.close = this.close.bind(this)
  }
  componentWillMount () {
    this.body_overflow_before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  componentWillUnmount () {
    document.body.style.overflow = this.body_overflow_before
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
