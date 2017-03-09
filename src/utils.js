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
  let s = document.createElement('script')
  s.src = url
  document.body.appendChild(s)
}

export {to_markdown, clean, auto_url_root, add_script}
