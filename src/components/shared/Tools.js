import React, { Component } from 'react'
import {Link} from 'react-router-dom'
import { to_markdown } from '../../utils'

export const If = ({v, children}) => (v ? children : <div/>)

export const IfElse = ({v, children}) => {
  if (children.length !== 2) {
    return <div style={{color: 'red'}}>{`IfElse should receive 2 children, not ${children.length}`}</div>
  } else if (v) {
    return children[0]
  } else {
    return children[1]
  }
}

export const Markdown = ({content}) => (
  <div className="tcs-md" dangerouslySetInnerHTML={{__html: to_markdown(content)}}/>
)

export const Photo = ({contractor, config, className}) => {
  let photo_src = contractor.photo
  if (photo_src.startsWith('/')) {
    photo_src = config.api_root + photo_src
  }
  return <img src={photo_src} alt={contractor.name} className={className}/>
}

export class AnimateLink extends Component {
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
      <Link to={this.props.to} className={extra_classes + 'tcs-animate-entry' + (this.state.show ? ' tcs-show' : '')}>
        {this.props.children}
      </Link>
    )
  }
}

export const DisplayExtraAttrs = ({extra_attributes}) => (
  <div>
    {extra_attributes && extra_attributes.map((attr, i) => (
      <div key={i} className="tcs-attr">
        <h3 className="tcs-attr-title">{attr.name}</h3>
        <IfElse v={attr.type === 'text_short' || attr.type === 'text_extended'}>
          <Markdown content={attr.value}/>
        {/*else*/}
          <p>{attr.value}</p>
        </IfElse>
      </div>
    ))}
  </div>
)

export const Bull = ({style}) => <span className="tcs-bull" style={style}>&bull;</span>
