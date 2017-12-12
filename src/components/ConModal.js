import React, { Component } from 'react'
import Modal from './Modal'
import {Location, IfElse} from './Tools'
import ConDetails from './ConDetails'
import Enquiry from './Enquiry'

class ConModal extends Component {
  constructor (props) {
    super(props)
    this.con_id = parseInt(this.props.id, 10)
    this.get_contractor = this.get_contractor.bind(this)
    this.state = {
      show_enquiry: false,
    }
  }

  get_contractor () {
    for (let contractor of this.props.contractors) {
      if (contractor.id === this.con_id) {
        return {contractor, contractor_extra: this.props.root.get_contractor_details(contractor)}
      }
    }
  }

  render () {
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
      <Modal history={this.props.history} title={contractor.name}>
        <div className="tcs-body">
          <div className="tcs-extra">
            <img src={contractor.photo} alt={contractor.name}/>

            <div className="tcs-location">
              <Location/>
              <span>{contractor.town}</span>
            </div>

            <IfElse v={this.state.show_enquiry}>
              <button onClick={() => this.setState({show_enquiry: false})}>
                {this.props.root.get_text('contractor_details_button', {contractor_name: contractor.name})}
              </button>
              <button onClick={() => this.setState({show_enquiry: true})}>
                {this.props.root.get_text('contractor_enquiry_button', {contractor_name: contractor.name})}
              </button>
            </IfElse>
          </div>
          <div className="tcs-content">
            <div className="tcs-aside tcs-md">{contractor.tag_line}</div>
            <div className="tcs-scroll">
              {/*<transition name="tcs-squeeze" mode="out-in">*/}
              <IfElse v={this.state.show_enquiry}>
                <Enquiry contractor={contractor} root={this.props.root} config={this.props.config}/>

                <ConDetails contractor={contractor}
                            contractor_extra={contractor_extra}
                            get_text={this.props.root.get_text}/>
              </IfElse>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}
export default ConModal

