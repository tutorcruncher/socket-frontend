import marked from 'marked'

marked.setOptions({
  gfm: true,
  sanitize: true,
  smartLists: true,
})

function to_markdown (t) {
  if (t === null || t === undefined) {
    return ''
  } else {
    return marked(t)
  }
}
export { to_markdown }
