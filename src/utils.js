import marked from 'marked'

marked.setOptions({
  gfm: true,
  sanitize: true,
  smartLists: true,
})

export function to_markdown (t) {
  if (t === null || t === undefined) {
    return ''
  } else {
    return marked(t)
  }
}
