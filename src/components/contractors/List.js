import React from 'react'
import {Location, Markdown, If, Photo, AnimateLink} from '../shared/Tools'
import Stars from './Stars'

export const Grid = ({contractors, root, config}) => (
  <div className="tcs-flex">
    {contractors.map((contractor, i) => (
      <AnimateLink key={i} delay={i * 50} to={root.url(contractor.link)} className="tcs-col">
        <div className="tcs-item tcs-box">
          <Photo contractor={contractor} config={config} className="tcs-thumb"/>
          <h3 className="tcs-name">{contractor.name}</h3>
        </div>
      </AnimateLink>
    ))}
  </div>
)

export const List = ({contractors, root, config}) => (
  <div className="tcs-list">
    {contractors.map((contractor, i) => (
      <AnimateLink key={i} delay={i * 80} to={root.url(contractor.link)} className="tcs-item">
        <div className="tcs-image-col">
          <Photo contractor={contractor} config={config} className="tcs-thumb"/>
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
            <div className="tcs-distance">
              <If v={contractor.distance !== null}>
                {root.get_text('distance_away', {distance: Math.round(contractor.distance / 100) / 10})}
              </If>
            </div>
          </div>
        </div>
      </AnimateLink>
    ))}
  </div>
)
