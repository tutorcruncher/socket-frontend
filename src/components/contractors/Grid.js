import React from 'react'
import {Link} from 'react-router-dom'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import { If } from '../shared/Tools'

const Grid = props => {
  let description = ''
  if (props.selected_subject) {
    const msg_id_suffix = props.contractors.length === 1 ? 'single' : 'plural'
    description = props.get_text('subject_filter_summary_' + msg_id_suffix, {
      count: props.contractors.length,
      subject: props.selected_subject.name,
    })
  }
  return (
    <div className="tcs-grid">
      <If v={props.config.subject_filter}>
        <div className="subject-select">
          <Select
            value={props.selected_subject && props.selected_subject.id}
            onChange={props.subject_change}
            labelKey='name'
            valueKey='id'
            options={props.subjects}/>
        </div>
        <div className="tcs-summary">
          {description}
        </div>
      </If>

      <div className="tcs-flex">
        {props.contractors.map((contractor, i) => (
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

export default Grid

