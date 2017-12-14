import React, { Component } from 'react'
import {Link} from 'react-router-dom'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import { If } from '../shared/Tools'
import { async_start } from '../../utils'

class Grid extends Component {
  state = {
    subjects: [],
    selected_subject: null,
  }
  subject_change = (selected_subject) => {
    this.setState({ selected_subject })
    this.props.get_contractors(selected_subject && selected_subject.id)
  }

  get_subjects = async () => {
    if (this.state.subjects.length > 0) {
      return
    }
    this.setState({subjects: await this.props.requests.get('subjects')})
  }

  async componentDidMount () {
    async_start(this.get_subjects)
  }

  render () {
    let description = ''
    if (this.state.selected_subject) {
      const msg_id_suffix = this.props.contractors.length === 1 ? 'single' : 'plural'
      description = this.props.get_text('subject_filter_summary_' + msg_id_suffix, {
        count: this.props.contractors.length,
        subject: this.state.selected_subject.name,
      })
    }
    return (
      <div className="tcs-grid">
        <If v={this.props.config.subject_filter}>
          <div className="subject-select">
            <Select
              value={this.state.selected_subject && this.state.selected_subject.id}
              onChange={this.subject_change}
              labelKey='name'
              valueKey='id'
              options={this.state.subjects}/>
          </div>
          <div className="tcs-summary">
            {description}
          </div>
        </If>

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

