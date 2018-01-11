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
  // * contractor slug
  // * /enquiry
  path = path
    .replace(/\/subject\/\d+-[^/]+$/, '/')
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
  window.ga('create', process.env.GA_ID || '-', 'auto', tcs_ga_name)
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

const clean = obj => {
  let new_obj = {}
  for (let [k, v] of Object.entries(obj)) {
    if (typeof v === 'object') {
      new_obj[k] = clean(v)
    } else if (v !== null && v !== undefined && v !== '') {
      new_obj[k] = v
    }
  }
  return new_obj
}

function request (app, path, send_data, method, expected_statuses) {
  let url = path
  if (!url.startsWith('http')) {
    url = `${app.props.config.api_root}/${app.props.public_key}/${path}`
  }

  if (Number.isInteger(expected_statuses)) {
    expected_statuses = [expected_statuses]
  } else {
    expected_statuses = expected_statuses || [200]
  }
  if (send_data) {
    send_data = JSON.stringify(clean(send_data))
  }
  // await sleep(2000)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const on_error = msg => {
      console.error('request error', msg, url, xhr)
      app.setState({error: msg})
      reject(msg)
    }
    xhr.open(method, url)
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.onload = () => {
      if (expected_statuses.includes(xhr.status)) {
        const data = JSON.parse(xhr.responseText)
        if (expected_statuses.length === 1) {
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
    xhr.send(send_data)
  })
}

export const requests = {
  get: async (app, path, args) => {
    if (args) {
      const arg_list = []
      const add_arg = (n, v) => arg_list.push(encodeURIComponent(n) + '=' + encodeURIComponent(v))
      for (let [name, value] of Object.entries(args)) {
        if (Array.isArray(value)) {
          for (let value_ of value) {
            add_arg(name, value_)
          }
        } else if (value !== null && value !== undefined) {
          add_arg(name, value)
        }
      }
      if (arg_list.length > 0) {
        path += '?' + arg_list.join('&')
      }
    }
    return await request(app, path, null, 'GET')
  },
  post: async (app, path, data, expected_statuses) => await request(app, path, data, 'POST', expected_statuses || 201)
}

export const async_start = (f, ...args) => setTimeout(async () => f(...args), 0)

export const slugify = text => (
   text
     .toLowerCase()
     .replace(/\s+/g, '-')     // Replace spaces with -
     .replace(/[^\w-]+/g, '') // Remove all non-word chars
     .replace(/--+/g, '-')   // Replace multiple - with single -
     .replace(/^-+/, '')       // Trim - from start of text
     .replace(/-+$/, '')       // Trim - from end of text
)
