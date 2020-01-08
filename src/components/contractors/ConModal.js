import React, { Component } from 'react'
import Modal from '../shared/Modal'
import {IfElse, Photo} from '../shared/Tools'
import {Location} from '../shared/Svgs'
import ConDetails from './ConDetails'
import EnquiryForm from '../shared/EnquiryForm'
import Stars from './Stars'

const TRANSITION_TIME = 500

class ConModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show_enquiry: false,
      transition_class: '',
      loaded: false,
    }
  }

  componentDidMount () {
    this.props.get_contractor(
        parseInt(this.props.id, 10),
        c => this.setState({contractor: c, loaded: true})
    )
  }

  switch_view = () => {
    this.setState({transition_class: ' in-trans'})
    setTimeout(() => {
      this.setState({show_enquiry: !this.state.show_enquiry, transition_class: ''})
    }, TRANSITION_TIME)
  }

  render () {
    if (!this.state.loaded) {
      return (
        <Modal history={this.props.history} title='' config={this.props.config}>
          <p>Loading...</p>
        </Modal>
      )
    }
    const contractor = this.state.contractor
    if (!contractor) {
      return (
        <Modal history={this.props.history} config={this.props.config} title='Contractor not Found'>
          <p>No Contractor found with id {this.props.id}.</p>
        </Modal>
      )
    }

    return (
      <Modal history={this.props.history} title={contractor.name} last_url={this.props.last_url} config={this.props.config}>
        <div className="tcs-extra">
          <Photo contractor={contractor} config={this.props.config}/>
          <Stars contractor={contractor} config={this.props.config}/>

          <div className="tcs-location">
            <Location/>
            <span>{contractor.town}</span>
          </div>

          <IfElse v={this.state.show_enquiry}>
            <button className="tcs-button" onClick={this.switch_view}>
              {this.props.config.get_text('contractor_details_button', {contractor_name: contractor.name})}
            </button>
            <button className="tcs-button" onClick={this.switch_view}>
              {this.props.config.get_text('contractor_enquiry_button', {contractor_name: contractor.name})}
            </button>
          </IfElse>
        </div>
        <div className="tcs-content">
          <div className="tcs-aside tcs-md">{contractor.tag_line}</div>
          <div className={'tcs-scroll con-modal-transition' + this.state.transition_class}
                style={{transition: `all ${TRANSITION_TIME}ms ease-in-out`}}>

            <IfElse v={this.state.show_enquiry}>
              <EnquiryForm contractor={contractor}
                           root={this.props.root}
                           config={this.props.config}
                           mode='con-modal'/>
            {/*else:*/}
              <ConDetails get_text={this.props.config.get_text} contractor={contractor}/>
            </IfElse>

          </div>
        </div>
      </Modal>
    )
  }
}

export default ConModal
