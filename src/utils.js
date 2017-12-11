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

export const clean = obj => {
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

export const auto_url_root = path => {
  // remove :
  // * contractor slug
  // * /enquiry
  path = path.replace(/\/\d+-[\w-]+$/, '/').replace(/\/enquiry$/, '/')
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
