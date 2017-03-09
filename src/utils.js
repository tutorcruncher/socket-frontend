import marked from 'marked'

marked.setOptions({
  gfm: true,
  sanitize: true,
  smartLists: true,
})

const to_markdown = (t) => {
  if (t === null || t === undefined) {
    return ''
  } else {
    return marked(t)
  }
}

const clean = (obj) => {
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

const auto_url_root = (path) => {
  // remove :
  // * contractor slug
  // * /enquiry
  path = path.replace(/\/\d+-[\w-]+$/, '/').replace(/\/enquiry$/, '/')
  return path
}

const add_script = (url) => {
  const s = document.createElement('script')
  s.async = true
  s.src = url
  document.body.appendChild(s)
}

/* istanbul ignore next */
const init_ga = (router, config) => {
  const ga_prefixes = []
  if (process.env.GA_ID === null || window._tcs_ga !== undefined) {
    return ga_prefixes
  }
  window._tcs_ga = true
  ga_prefixes.push('tcs.')
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
  window.ga('create', 'UA-41117087-3', 'auto', 'tcs')
  window.ga('tcs.set', 'dimension1', config.mode)
  window.ga('tcs.set', 'dimension2', config.router_mode)
  let initial_load = true

  router.afterEach(to => {
    const _prefixes = initial_load ? ['tcs.'] : ga_prefixes
    for (let prefix of _prefixes) {
      window.ga(prefix + 'set', 'page', to.fullPath)
      window.ga(prefix + 'send', 'pageview')
    }
  })
  return ga_prefixes
}

export {to_markdown, clean, auto_url_root, add_script, init_ga}
