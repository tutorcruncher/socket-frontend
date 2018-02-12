import React from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import {If} from '../shared/Tools'

export const SubjectSelect = ({get_text, show, subjects, selected_subject, subject_change}) => {
  return (
    <div className="tcs-contractor-filter">
      <If v={show}>
        <Select
          value={selected_subject && selected_subject.id}
          onChange={subject_change}
          placeholder={get_text('subject_filter_placeholder')}
          labelKey='name'
          valueKey='id'
          options={subjects}/>
      </If>
    </div>
  )
}


export const LocationInput = ({get_text, show, loc_raw, loc_change, submit}) => {
  return (
    <div className="tcs-contractor-filter tcs-location-filter">
      <If v={show}>
        <input className="tcs-location-input"
               type="text"
               value={loc_raw || ''}
               onChange={v => loc_change(v.target.value || null)}
               onKeyPress={v => v.key === 'Enter' && submit()}
               placeholder={get_text('location_input_placeholder')}/>
        <span className="tcs-location-clear"
              style={{visibility: loc_raw === null ? 'hidden' : 'visible'}}
              onClick={() => loc_change(null) || submit(null)}>
          ×
        </span>
      </If>
    </div>
  )
}

