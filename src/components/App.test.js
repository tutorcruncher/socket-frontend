import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router} from 'react-router-dom'
import App from './App'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const config = {
    router_mode: 'history',
    mode: 'grid',
  }
  ReactDOM.render(<Router><App config={config}/></Router>, div)
})
