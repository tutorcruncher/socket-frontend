import React from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

const SelectSubject = ({get_text, contractors, subjects, selected_subject, subject_change}) => {
  let description = ''
  if (selected_subject) {
    const msg_id_suffix = contractors.length === 1 ? 'single' : 'plural'
    description = get_text('subject_filter_summary_' + msg_id_suffix, {
      count: contractors.length,
      subject: selected_subject.name,
    })
  }
  return [
    <div key="select" className="subject-select">
      <Select
        value={selected_subject && selected_subject.id}
        onChange={subject_change}
        labelKey='name'
        valueKey='id'
        options={subjects}/>
    </div>,
    <div key="summary" className="tcs-summary">
      {description}
    </div>
  ]
}

export default SelectSubject
