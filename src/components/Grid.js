import React, { Component } from 'react'
import {Link} from 'react-router-dom'

class Grid extends Component {
  constructor (props) {
    super(props)
    this.state = {
      description: '',
    }
  }

  componentDidMount () {
    // if (this.$root.selected_subject_id) {
    //   const msg_id_suffix = this.props.contractors.length === 1 ? 'single' : 'plural'
    //   const subject = this.$root.get_selected_subject()
    //   return this.$root.get_text('subject_filter_summary_' + msg_id_suffix, {
    //     count: this.$root.contractors.length,
    //     subject: subject && subject.name,
    //   })
    // }
  }

  render () {
    return (
      <div className="tcs-grid">
        {this.props.config.subject_filter &&
        <div>
          {/*<subject_select className="subject-select"></subject_select>*/}
          <div className="tcs-summary">
            {this.state.description}
          </div>
        </div>
        }
        <div className="tcs-flex">
          {this.props.contractors.map((contractor, i) => (
            <div key={i} className="tcs-col">
              <Link to={`/${contractor.link}`} className="tcs-box">
                <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
                <h3 className="tcs-name">{contractor.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default Grid

