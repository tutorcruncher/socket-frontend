import React from 'react'
import {Link} from 'react-router-dom'

export const Grid = ({contractors, url}) => (
  <div className="tcs-flex">
    {contractors.map((contractor, i) => (
      <div key={i} className="tcs-col">
        <Link to={url(contractor.link)} className="tcs-box">
          <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
          <h3 className="tcs-name">{contractor.name}</h3>
        </Link>
      </div>
    ))}
  </div>
)

export const List = ({contractors, url}) => (
  <div className="tcs-list">
    {contractors.map((contractor, i) => (
      <div key={i}>
        <Link to={url(contractor.link)}>
          <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
          <h3 className="tcs-name">{contractor.name}</h3>
          <div><b>{contractor.tag_line}</b></div>
          <div>{contractor.primary_description}</div>
        </Link>
      </div>
    ))}
  </div>
)
