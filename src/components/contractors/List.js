import React from 'react'
import {Link} from 'react-router-dom'
import { Location, Markdown } from '../shared/Tools'

export const Grid = ({contractors, root}) => (
  <div className="tcs-flex">
    {contractors.map((contractor, i) => (
      <div key={i} className="tcs-col">
        <Link to={root.url(contractor.link)} className="tcs-box">
          <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
          <h3 className="tcs-name">{contractor.name}</h3>
        </Link>
      </div>
    ))}
  </div>
)

export const List = ({contractors, root}) => (
  <div className="tcs-list">
    {contractors.map((contractor, i) => (
      <div key={i}>
        <Link to={root.url(contractor.link)} className="tcs-box">
          <div>
            <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
            <div className="tcs-location">
              <Location/>
              <span>{contractor.town}</span>
            </div>
          </div>

          <div className="tcs-info">
            <h3 className="tcs-name">{contractor.name}</h3>
            <div className="tcs-aside">
              {contractor.tag_line}
            </div>
            <div className="tcs-primary-description">
              <Markdown content={contractor.primary_description}/>
            </div>
            <div className="tcs-fadeout"/>
          </div>

          <div className="tcs-box-extra">
            <div className="tcs-shim"/>
            <button>
              {root.get_text('view_profile')}
            </button>
          </div>
        </Link>
      </div>
    ))}
  </div>
)