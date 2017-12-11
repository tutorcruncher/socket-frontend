import React, { Component } from 'react'
import Modal from './Modal'

class ConDetails extends Component {
  constructor (props) {
    super(props)
    this.con_id = parseInt(this.props.id, 10)
    this.get_contractor = this.get_contractor.bind(this)
  }

  get_contractor () {
    for (let contractor of this.props.contractors) {
      if (contractor.id === this.con_id) {
        // this.$root.get_contractor_details(contractor.url, contractor.link)
        return contractor
      }
    }
    return {}
  }

  render () {
    const contractor = this.get_contractor()
    return (
      <Modal history={this.props.history} title={contractor.name}>
        <div>
          <pre>{JSON.stringify(contractor, null, 2)}</pre>
        </div>
      </Modal>
    )
  }
}

export default ConDetails

