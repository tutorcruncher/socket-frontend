import React, { Component } from 'react'
import Modal from '../shared/Modal'
import {Location, IfElse, Photo} from '../shared/Tools'
import ConDetails from './ConDetails'
import EnquiryForm from '../shared/EnquiryForm'
import Stars from './Stars'

const TRANSITION_TIME = 500

class ConModal extends Component {
  constructor (props) {
    super(props)
    this.con_id = parseInt(this.props.id, 10)
    this.state = {
      show_enquiry: false,
      transition_class: '',
    }
    this.get_contractor = this.get_contractor.bind(this)
    this.switch_view = this.switch_view.bind(this)
  }

  get_contractor () {
    for (let contractor of this.props.contractors) {
      if (contractor.id === this.con_id) {
        return {contractor, contractor_extra: this.props.get_contractor_details(contractor)}
      }
    }
  }

  switch_view () {
    this.setState({transition_class: ' in-trans'})
    setTimeout(() => {
      this.setState({show_enquiry: !this.state.show_enquiry, transition_class: ''})
    }, TRANSITION_TIME)
  }

  render () {
    if (!this.props.got_contractors) {
      return (
        <Modal history={this.props.history} title=''>
          <p>Loading...</p>
        </Modal>
      )
    }
    const _con = this.get_contractor()
    if (!_con) {
      return (
        <Modal history={this.props.history} title='Contractor not Found'>
          <p>No Contractor found with id {this.props.id}.</p>
        </Modal>
      )
    }
    const {contractor, contractor_extra} = _con
    return (
      <Modal history={this.props.history} title={contractor.name} last_url={this.props.last_url}>
        <div className="tcs-extra">
          <Photo contractor={contractor} config={this.props.config}/>

          <Stars contractor={contractor} root={this.props.root}/>

          <div className="tcs-location">
            <Location/>
            <span>{contractor.town}</span>
          </div>

          <IfElse v={this.state.show_enquiry}>
            <button className="tcs-button" onClick={this.switch_view}>
              {this.props.root.get_text('contractor_details_button', {contractor_name: contractor.name})}
            </button>
            <button className="tcs-button" onClick={this.switch_view}>
              {this.props.root.get_text('contractor_enquiry_button', {contractor_name: contractor.name})}
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
              <ConDetails contractor={contractor}
                          contractor_extra={contractor_extra}
                          get_text={this.props.root.get_text}/>
            </IfElse>

          </div>
        </div>
      </Modal>
    )
  }
}

export default ConModal
