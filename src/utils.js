import marked from 'marked'

marked.setOptions({
  gfm: true,
  sanitize: true,
  smartLists: true,
})

export const to_markdown = t => {
  if (t === null || t === undefined) {
    return ''
  } else {
    return marked(t)
  }
}

export const auto_url_root = path => {
  // remove :
  // * /subject/.*
  // * /page/.*
  // * contractor slug
  // * /enquiry
  path = path
    .replace(/\/subject\/\d+-[^/]+$/, '/')
    .replace(/\/page\/\d+-[^/]+$/, '/')
    .replace(/\/\d+-[^/]+$/, '/')
    .replace(/\/enquiry$/, '/')
  return path
}

export const add_script = url => {
  const s = document.createElement('script')
  s.async = true
  s.src = url
  document.body.appendChild(s)
}

export const google_analytics = (history, config) => {
  const ga_prefixes = []
  const tcs_ga_name = `${config.mode.replace('-', '')}tcs`
  ga_prefixes.push(tcs_ga_name + '.')
  /* istanbul ignore next */
  if (window.ga === undefined) {
    // taken from https://developers.google.com/analytics/devguides/collection/analyticsjs/
    add_script('https://www.google-analytics.com/analytics.js')
    window.ga = function () {
      (window.ga.q = window.ga.q || []).push(arguments)
    }
    window.ga.l = Number(new Date())
  } else {
    ga_prefixes.push('')
  }
  window.ga('create', process.env.REACT_APP_GA_ID || '-', 'auto', tcs_ga_name)
  window.ga(tcs_ga_name + '.set', 'dimension1', config.mode)
  window.ga(tcs_ga_name + '.set', 'dimension2', config.router_mode)

  if (!window._tcs_ga) {
    window.ga(tcs_ga_name + '.send', 'pageview')
  }
  window._tcs_ga = true

  history.listen(loc => {
    for (let prefix of ga_prefixes) {
      window.ga(prefix + 'set', 'page', loc.pathname)
      window.ga(prefix + 'send', 'pageview')
    }
  })

  return ga_prefixes
}

export function get_company_options (public_key, config) {
  const url = `${config.api_root}/${public_key}/options`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const on_error = msg => {
      console.error('request error', msg, url, xhr)
      reject(msg)
    }
    xhr.open('GET', url)
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve(data)
      } else {
        on_error(`wrong response code ${xhr.status}, Response: ${xhr.responseText.substr(0, 500)}`)
      }
    }
    xhr.onerror = () => on_error(`Error requesting data ${xhr.statusText}: ${xhr.status}`)
    xhr.send()
  })
}

export function request (method, path, config) {
  let url = path
  if (url.startsWith('/')) {
    url = this.props.config.api_root + url
  } else if (!url.startsWith('http')) {
    url = `${this.props.config.api_root}/${this.props.public_key}/${path}`
  }

  config = config || {}
  if (config.args) {
    const arg_list = []
    const add_arg = (n, v) => arg_list.push(encodeURIComponent(n) + '=' + encodeURIComponent(v))
    for (let [name, value] of Object.entries(config.args)) {
      if (Array.isArray(value)) {
        for (let value_ of value) {
          add_arg(name, value_)
        }
      } else if (value !== null && value !== undefined) {
        add_arg(name, value)
      }
    }
    if (arg_list.length > 0) {
      url += '?' + arg_list.join('&')
    }
  }

  if (Number.isInteger(config.expected_statuses)) {
    config.expected_statuses = [config.expected_statuses]
  } else {
    config.expected_statuses = config.expected_statuses || [200]
  }
  if (config.send_data) {
    config.send_data = JSON.stringify(config.send_data)
  }
  // await sleep(2000)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const on_error = msg => {
      console.error('request error', msg, url, xhr)
      if (config.set_app_state !== false) {
        this.setState({error: msg})
      }
      reject({msg, url, xhr})
    }
    xhr.open(method, url)
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.onload = () => {
      if (config.expected_statuses.includes(xhr.status)) {
        const data = JSON.parse(xhr.responseText)
        if (config.expected_statuses.length === 1) {
          resolve(data)
        } else {
          resolve({
            xhr: xhr,
            status: xhr.status,
            data: data
          })
        }
      } else {
        on_error(`wrong response code ${xhr.status}, Response: ${xhr.responseText.substr(0, 500)}`)
      }
    }
    xhr.onerror = () => on_error(`Error requesting data ${xhr.statusText}: ${xhr.status}`)
    xhr.send(config.send_data)
  })
}

export const slugify = text => (
   text
     .toLowerCase()
     .replace(/\s+/g, '-')     // Replace spaces with -
     .replace(/[^\w-]+/g, '')  // Remove all non-word chars
     .replace(/--+/g, '-')     // Replace multiple - with single -
     .replace(/^-+/, '')       // Trim - from start of text
     .replace(/-+$/, '')       // Trim - from end of text
)

export function colour_contrast (colour) {
  let r = 0
  let g = 0
  let b = 0
  let c
  if (/rgba/.test(colour)) {
    c = colour.replace('rgba(', '').replace(')', '').split(/,/)
    r = c[0]
    g = c[1]
    b = c[2]
  } else if (/rgb/.test(colour)) {
    c = colour.replace('rgb(', '').replace(')', '').split(/,/)
    r = c[0]
    g = c[1]
    b = c[2]
  } else if (/#/.test(colour)) {
    c = colour.replace('#', '')
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
    }
    r = parseInt(c.substr(0, 2), 16)
    g = parseInt(c.substr(2, 2), 16)
    b = parseInt(c.substr(4, 2), 16)
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? 'light' : 'dark'
}

export const group_by = (items, key_getter) => {
  const groups = []
  let key, current_key
  for (let item of items) {
    key = key_getter(item)
    if (groups.length && current_key === key) {
      groups[groups.length - 1].push(item)
    } else {
      groups.push([item])
      current_key = key
    }
  }
  return groups
}
