import type { PaymentConfig } from '@/api/types'

/** Public configuration for the Socket widget: the second argument to window.socket(). */
export type SocketMode =
  | 'tutors'
  | 'enquiry'
  | 'enquiry-modal'
  | 'subject-enquiry'
  | 'appointments'
  | 'packages'
export type RouterMode = 'hash' | 'memory'
/** Visual variant. `classic` is the TutorCruncher look; the others adapt to the host page. */
export type SocketTheme = 'classic' | 'soft' | 'bold' | 'elegant' | 'vivid'
export const THEMES: SocketTheme[] = ['classic', 'soft', 'bold', 'elegant', 'vivid']

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

export type DateFormat =
  | 'full'
  | 'month'
  | 'month_year'
  | 'month_day'
  | 'day'
  | 'weekday'
  | 'time'

export interface Currency {
  symbol: string
  code?: string
}

/** What a caller may pass to window.socket(public_key, config). All optional. */
export interface UserConfig {
  element?: string
  mode?: SocketMode
  /** Which view "tutors" mode opens on. Defaults to the company's display_mode. */
  display_mode?: 'grid' | 'list'
  router_mode?: RouterMode
  /** Visual variant; defaults to `classic`. See styles/themes.css. */
  theme?: SocketTheme
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
  /** Which view the "tutors" mode opens on. The visitor can switch it in-widget. */
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
  /** SSO endpoint for the appointment booking flow: required by "Book Lesson". */
  auth_url?: string
  terms_link?: string
  distance_units?: 'miles' | 'km'
  name?: string
  name_display?: string
  /** Payment configuration for booking checkout. V2 contract. */
  payment?: PaymentConfig
  /** Any future server-side option flows through the generic merge. */
  [key: string]: unknown
}

/** Fully-resolved config used internally throughout the app. */
export interface ResolvedConfig extends FormatHelpers {
  public_key: string
  element: string
  mode: SocketMode
  /** Initial grid/list view for the "tutors" mode; the visitor can switch it in-widget. */
  display_mode: 'grid' | 'list'
  router_mode: RouterMode
  theme: SocketTheme
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
  distance_units?: 'miles' | 'km'
  name?: string
  name_display?: string
  payment?: PaymentConfig
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
