/**
 * The widget editor's preview page. TutorCruncher's editor (Settings > Integrations > Widgets) frames
 * preview.html and posts it the widget's unsaved settings as the admin changes them:
 *
 *   { type: 'tc-widget-preview', version: 1, kind, name, key, config, labels, branch }
 *
 * `config` is in the shape GET /widgets/<key>/options/ returns (records as {id, name}), `labels` names
 * the values of its lists of choices (an enquiry's fields) and `branch` is options' branch object. Each
 * new message remounts the widget with those settings; a repeat of the last is ignored.
 *
 * TutorCruncher's list endpoints for widgets don't exist yet, so the widget draws the demo company's
 * tutors and lessons (the same proxy and mock layer as the dev harness). That is why only the settings
 * for how the widget looks and what it shows are applied: filtering the demo data by the company's own
 * labels, subjects or Jobs would leave it empty. An enquiry form is the exception: its fields are the
 * admin's choice, so the demo company's form is rewritten to them (`enquirySchema`).
 */
import './embed'
import type { SocketMode, UserConfig } from './config/types'
import type { EnquiryField, EnquiryFormInfo } from './api/types'

const PREVIEW_MESSAGE = 'tc-widget-preview'
const READY_MESSAGE = 'tc-widget-preview-ready'

const env = import.meta.env
const demoKey = env.VITE_DEMO_PUBLIC_KEY ?? '9c79f14df986a1ec693c'
const apiRoot = env.VITE_DEMO_API_ROOT || undefined
// Comma-separated TutorCruncher origins allowed to drive the preview. Unset, any localhost port may (dev).
const allowedOrigins = (env.VITE_TC_ORIGINS ?? '')
  .split(',')
  .map((origin: string) => origin.trim())
  .filter(Boolean)

type WidgetKind = 'contractors' | 'services' | 'enquiry' | 'subject_enquiry' | 'packages'
type NamedRecord = { id: number; name: string }

interface PreviewMessage {
  type: typeof PREVIEW_MESSAGE
  version: number
  kind: WidgetKind
  name: string
  key: string | null
  config: Record<string, unknown>
  labels: Record<string, Record<string, string>>
  branch: { currency: string; timezone: string }
}

// The enquiry fields TutorCruncher offers that the demo company's form doesn't have.
const SAMPLE_FIELDS: Record<string, Omit<EnquiryField, 'label' | 'required'>> = {
  subject: {
    type: 'select',
    field: 'subject',
    choices: ['Maths', 'English', 'Science'].map((name) => ({ value: name, display_name: name })),
  },
  qual_level: {
    type: 'select',
    field: 'qual_level',
    choices: ['GCSE', 'A Level'].map((name) => ({ value: name, display_name: name })),
  },
}

function originAllowed(origin: string): boolean {
  if (allowedOrigins.length) {
    return allowedOrigins.includes(origin)
  } else {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  }
}

function currencySymbol(code: string): string {
  const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code }).formatToParts(0)
  return parts.find((part) => part.type === 'currency')?.value ?? code
}

function modeFor(message: PreviewMessage): SocketMode {
  switch (message.kind) {
    case 'contractors':
      return 'tutors'
    case 'services':
      return 'appointments'
    case 'enquiry':
      return message.config.display === 'modal' ? 'enquiry-modal' : 'enquiry'
    case 'subject_enquiry':
      return 'subject-enquiry'
    case 'packages':
      return 'packages'
  }
}

/** The widget config for a message: its kind's look-and-show settings, and the branch's currency and time zone. */
function userConfig(message: PreviewMessage): UserConfig {
  const config = message.config
  const userConfig: UserConfig = {
    mode: modeFor(message),
    router_mode: 'memory',
    currency: { code: message.branch.currency, symbol: currencySymbol(message.branch.currency) },
    timezone: message.branch.timezone,
  }
  if (message.kind === 'contractors') {
    Object.assign(userConfig, {
      display_mode: config.layout as 'grid' | 'list',
      sort_on: config.sort as string,
      show_location_search: Boolean(config.show_location_search),
      // A widget set to one subject hides the filter, as visitors can't choose another.
      show_subject_filter: Boolean(config.show_subject_filter) && !(config.subject as NamedRecord | null),
      show_stars: Boolean(config.show_stars),
      show_hours_reviewed: Boolean(config.show_hours),
      show_labels: Boolean(config.show_labels),
    })
  } else if (message.kind === 'enquiry' || message.kind === 'subject_enquiry') {
    if (config.terms_url) userConfig.terms_link = config.terms_url as string
    if (config.thank_you) {
      userConfig.messages = {
        enquiry_submitted_thanks: config.thank_you as string,
        enquiry_modal_submitted_thanks: config.thank_you as string,
      }
    }
  }
  return userConfig
}

/** The demo company's enquiry form cut to the fields the admin chose: name and email, then those shown. */
function enquirySchema(schema: EnquiryFormInfo, message: PreviewMessage): EnquiryFormInfo {
  const shown = (message.config.form_fields as string[] | undefined) ?? []
  const required = new Set((message.config.required_fields as string[] | undefined) ?? [])
  const labels = message.labels.form_fields ?? {}
  const contact = schema.visible
    .filter((f) => !f.prefix && (f.field === 'client_name' || f.field === 'client_email'))
    .map((f) => ({ ...f, required: true }))
  const chosen = shown.map((name): EnquiryField => {
    const own = schema.visible.find((f) => !f.prefix && f.field === name)
    const base = own ?? SAMPLE_FIELDS[name] ?? { type: 'text', field: name, prefix: 'attributes' }
    return { ...base, label: labels[name] ?? name, required: required.has(name) }
  })
  return { ...schema, visible: [...contact, ...chosen] }
}

let latest: PreviewMessage | null = null

// The enquiry form's schema is read through fetch, so its response is rewritten on the way in.
const realFetch = window.fetch.bind(window)
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response = await realFetch(input, init)
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const isEnquiry = latest?.kind === 'enquiry' || latest?.kind === 'subject_enquiry'
  if (latest && isEnquiry && response.ok && /\/enquiry\/?(\?|$)/.test(url)) {
    const schema = (await response.clone().json()) as EnquiryFormInfo
    return new Response(JSON.stringify(enquirySchema(schema, latest)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    return response
  }
}

let mounted = 0
let lastMessage = ''

function render(message: PreviewMessage) {
  // The editor sends on its start, on the frame's load and when asked, often the same settings twice.
  const serialised = JSON.stringify(message)
  if (serialised === lastMessage) return
  lastMessage = serialised
  latest = message
  const host = document.getElementById('preview')!
  // A fresh element each time, so the last widget's render tree goes with the old one.
  const element = document.createElement('div')
  element.id = `tc-preview-${++mounted}`
  host.replaceChildren(element)
  window.socket(demoKey, { ...userConfig(message), element: `#${element.id}`, api_root: apiRoot })
}

window.addEventListener('message', (event: MessageEvent) => {
  if (originAllowed(event.origin) && event.data?.type === PREVIEW_MESSAGE && event.data.version === 1) {
    render(event.data as PreviewMessage)
  }
})

// The editor may have posted before this listener existed. The ping carries nothing, so any origin may see it.
window.parent.postMessage({ type: READY_MESSAGE }, '*')
