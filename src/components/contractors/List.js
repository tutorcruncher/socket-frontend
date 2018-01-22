import React, { Component } from 'react'
import {Link} from 'react-router-dom'
import {Location, Markdown} from '../shared/Tools'
import Stars from './Stars'

class AnimateLink extends Component {
  constructor (props) {
    super(props)
    this.state = {show: false}
  }

  async componentDidMount () {
    setTimeout(() => this.setState({show: true}), this.props.delay || 0)
  }

  render () {
    const extra_classes = this.props.className ? this.props.className + ' ' : ''
    return (
      <Link to={this.props.to} className={extra_classes + 'tcs-animate-entry' + (this.state.show ? ' show' : '')}>
        {this.props.children}
      </Link>
    )
  }
}

export const Grid = ({contractors, root}) => (
  <div className="tcs-flex">
    {contractors.map((contractor, i) => (
      <AnimateLink key={i} delay={i * 50} to={root.url(contractor.link)} className="tcs-col">
        <div className="tcs-item tcs-box">
          <img src={contractor.photo} alt={contractor.name} className="tcs-thumb"/>
          <h3 className="tcs-name">{contractor.name}</h3>
        </div>
      </AnimateLink>
    ))}
  </div>
)

export const List = ({contractors, root}) => (
  <div className="tcs-list">
    {contractors.map((contractor, i) => (
      <AnimateLink key={i} delay={i * 80} to={root.url(contractor.link)} className="tcs-item">
        <div className="tcs-image-col">
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
      </AnimateLink>
    ))}
  </div>
)
