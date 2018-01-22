import React from 'react'
import {Link} from 'react-router-dom'
import {Location, Markdown} from '../shared/Tools'
import Stars from './Stars'

export const Grid = ({contractors, root}) => (
  <div className="tcs-flex">
    {contractors.map((contractor, i) => (
      <div key={i} className="tcs-col">
        <Link to={root.url(contractor.link)} className="tcs-item tcs-box">
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
      <Link key={i} to={root.url(contractor.link)} className="tcs-item">
        <div className="tcs-image-col tcs-box">
          <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
          <button className="tcs-button">
            {root.get_text('view_profile')}
          </button>
        </div>

        <div className="tcs-info">
          <h3 className="tcs-name">{contractor.name}</h3>
          <div className="tcs-aside">
            {contractor.tag_line}
          </div>
          <div className="tcs-primary-description">
            <Markdown content={contractor.primary_description}/>
            <div className="tcs-fadeout"/>
          </div>
        </div>

        <div className="tcs-list-extra">
          <Stars contractor={contractor} root={root}/>

          <div className="tcs-location">
            <Location/>
            <span>{contractor.town}</span>
          </div>
        </div>
      </Link>
    ))}
  </div>
)
