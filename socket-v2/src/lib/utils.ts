import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: false })

/** Render markdown to sanitized HTML. Replaces the old `marked({sanitize:true})`,
 *  which was removed upstream: we now sanitize the output with DOMPurify. */
export function toMarkdown(t: string | null | undefined): string {
  if (t === null || t === undefined) return ''
  return DOMPurify.sanitize(marked.parse(t, { async: false }) as string)
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Strip dynamic route segments so we can derive the base path of the host page. */
export const autoUrlRoot = (path: string): string =>
  path
    .replace(/\/subject\/\d+-[^/]+$/, '/')
    .replace(/\/page\/\d+-[^/]+$/, '/')
    .replace(/\/\d+-[^/]+$/, '/')
    .replace(/\/enquiry$/, '/')

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')

/** Decide whether text on a coloured background should be light or dark. */
export function colourContrast(colour: string): 'light' | 'dark' {
  let r = 0
  let g = 0
  let b = 0
  if (/rgba?/.test(colour)) {
    const c = colour.replace(/rgba?\(/, '').replace(')', '').split(/,/)
    r = Number(c[0])
    g = Number(c[1])
    b = Number(c[2])
  } else if (colour.includes('#')) {
    let c = colour.replace('#', '')
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
    r = parseInt(c.substr(0, 2), 16)
    g = parseInt(c.substr(2, 2), 16)
    b = parseInt(c.substr(4, 2), 16)
  }
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? 'light' : 'dark'
}

/** Group consecutive items by a key (preserves order; only groups adjacent matches). */
export function groupBy<T>(items: T[], keyGetter: (item: T) => string): T[][] {
  const groups: T[][] = []
  let currentKey: string | undefined
  for (const item of items) {
    const key = keyGetter(item)
    if (groups.length && currentKey === key) {
      groups[groups.length - 1].push(item)
    } else {
      groups.push([item])
      currentKey = key
    }
  }
  return groups
}

/** Tiny classnames helper. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
