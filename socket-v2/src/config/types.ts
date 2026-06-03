/** Public configuration for the Socket widget — the second argument to window.socket(). */
export type SocketMode = 'grid' | 'list' | 'enquiry' | 'enquiry-modal' | 'appointments'
export type RouterMode = 'hash' | 'history'

/** A translatable string: either a literal, or a function of replacement values. */
export type Message = string | ((replacements: Record<string, unknown>) => string)
export type Messages = Record<string, Message>

/** Format helpers, bound to the resolved config so they can read currency/timezone. */
export interface FormatHelpers {
  format_dt: (ts: string, fmt: DateFormat) => string
  format_duration: (ts1: string, ts2: string) => string
  format_money: (amount: number) => string
  get_text: (name: string, replacements?: Record<string, unknown>) => string
}

export type DateFormat = 'full' | 'month' | 'day' | 'weekday' | 'time'

export interface Currency {
  symbol: string
  code?: string
}

/** What a caller may pass to window.socket(public_key, config). All optional. */
export interface UserConfig {
  element?: string
  mode?: SocketMode
  router_mode?: RouterMode
  api_root?: string | null
  url_root?: string
  pagination?: number
  sort_on?: string
  show_subject_filter?: boolean
  show_location_search?: boolean
  show_labels?: boolean
  show_stars?: boolean
  show_hours_reviewed?: boolean
  labels_include?: string[]
  labels_exclude?: string[]
  terms_link?: string
  modal_container?: string
  timezone?: string
  currency?: Currency
  messages?: Messages
  event_callback?: (name: string, data: unknown) => void
  /** SSO endpoint used by the appointments booking flow. */
  auth_url?: string
  /** Overridable format helpers. */
  format_dt?: FormatHelpers['format_dt']
  format_duration?: FormatHelpers['format_duration']
  format_money?: FormatHelpers['format_money']
  get_text?: FormatHelpers['get_text']
}

/** Options served by the API's /{public_key}/options endpoint. */
export interface CompanyOptions {
  display_mode: 'grid' | 'list'
  pagination: number
  router_mode: RouterMode
  show_hours_reviewed: boolean
  show_labels: boolean
  show_location_search: boolean
  show_stars: boolean
  show_subject_filter: boolean
  sort_on: string
  currency?: Currency
}

/** Fully-resolved config used internally throughout the app. */
export interface ResolvedConfig extends FormatHelpers {
  public_key: string
  element: string
  mode: SocketMode
  router_mode: RouterMode
  api_root: string
  url_root: string
  pagination: number
  sort_on: string
  show_subject_filter: boolean
  show_location_search: boolean
  show_labels: boolean
  show_stars: boolean
  show_hours_reviewed: boolean
  terms_link?: string
  modal_container?: string
  timezone: string
  currency?: Currency
  auth_url?: string
  messages: Messages
  contractor_filter: { label?: string[]; label_exclude?: string[] }
  event_callback: (name: string, data: unknown) => void
  /** A stable random id for this widget instance (used for DOM/aria ids). */
  random_id: string
  grecaptcha_key: string
}

/** The handle returned from window.socket(...) for external use. */
export interface SocketInstance {
  goto: (path: string) => void
  config: ResolvedConfig
}
