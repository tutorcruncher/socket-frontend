import type {
  CompanyOptions,
  ResolvedConfig,
  SocketMode,
  UserConfig,
} from './types'
import { DEFAULT_COMPANY_OPTIONS, MODES, ROUTER_MODES, STRINGS } from './strings'
import {
  browserTimezone,
  format_dt,
  format_duration,
  format_money,
  get_text,
  type FormatContext,
} from '@/lib/formatting'
import { autoUrlRoot } from '@/lib/utils'

const env = import.meta.env

export interface BuildConfigResult {
  config: ResolvedConfig
  error: string | null
}

/**
 * Resolve a raw UserConfig into a fully-populated ResolvedConfig, mirroring the
 * behaviour of the legacy `window.socket()` initialiser (mode/router validation,
 * url_root auto-detection, label filters, format helper binding, company options
 * merge). `getCompanyOptions` is injected so this stays pure/testable.
 */
export async function buildConfig(
  publicKey: string,
  user: UserConfig | undefined,
  getCompanyOptions: (publicKey: string, apiRoot: string) => Promise<CompanyOptions>,
): Promise<BuildConfigResult> {
  const u: UserConfig = user ?? {}
  let error: string | null = null

  let mode: SocketMode = u.mode ?? 'grid'
  if (u.mode && !MODES.includes(u.mode)) {
    error = `invalid mode "${u.mode}", options are: ${MODES.join(', ')}`
    mode = 'grid'
  }

  const apiRoot = u.api_root || env.VITE_SOCKET_API_URL || 'https://socket.tutorcruncher.com'

  // url_root resolution
  let urlRoot = u.url_root ?? 'auto'
  if (urlRoot !== 'auto' && urlRoot[0] !== '/') {
    error = 'the "url_root" config parameter should start (and probably end) with a slash "/"'
    urlRoot = '/'
  }
  if (urlRoot === 'auto') {
    urlRoot = autoUrlRoot(window.location.pathname)
  }

  // router_mode: enquiry defaults to history so it doesn't add a hash to the URL
  let routerMode = u.router_mode
  if (!routerMode) {
    routerMode = mode === 'enquiry' ? 'history' : 'hash'
  } else if (!ROUTER_MODES.includes(routerMode)) {
    error = `invalid router mode "${routerMode}", options are: ${ROUTER_MODES.join(', ')}`
    routerMode = 'hash'
  }

  const contractorFilter: ResolvedConfig['contractor_filter'] = {}
  if (u.labels_include) contractorFilter.label = u.labels_include
  if (u.labels_exclude) contractorFilter.label_exclude = u.labels_exclude

  const messages = { ...STRINGS, ...(u.messages ?? {}) }
  const timezone = u.timezone || browserTimezone

  // Fetch server-side company options, falling back to safe defaults on error.
  let company: CompanyOptions
  try {
    company = await getCompanyOptions(publicKey, apiRoot)
  } catch (e) {
    error = String(e)
    company = { ...DEFAULT_COMPANY_OPTIONS }
  }

  // Build resolved config: explicit user config wins over company options.
  const config: ResolvedConfig = {
    public_key: publicKey,
    element: u.element ?? '#socket',
    mode: u.mode ?? company.display_mode ?? mode,
    router_mode: routerMode,
    api_root: apiRoot,
    url_root: urlRoot,
    pagination: u.pagination ?? company.pagination ?? 100,
    sort_on: u.sort_on ?? company.sort_on ?? 'name',
    show_subject_filter: u.show_subject_filter ?? company.show_subject_filter ?? true,
    show_location_search: u.show_location_search ?? company.show_location_search ?? true,
    show_labels: u.show_labels ?? company.show_labels ?? true,
    show_stars: u.show_stars ?? company.show_stars ?? true,
    show_hours_reviewed: u.show_hours_reviewed ?? company.show_hours_reviewed ?? true,
    terms_link: u.terms_link,
    modal_container: u.modal_container,
    timezone,
    currency: u.currency ?? company.currency,
    auth_url: u.auth_url,
    messages,
    contractor_filter: contractorFilter,
    event_callback: u.event_callback ?? (() => null),
    random_id: Math.random().toString(36).substring(2, 10),
    grecaptcha_key: env.VITE_GRECAPTCHA_KEY ?? '',
    // placeholders, bound below
    format_dt: format_dt as ResolvedConfig['format_dt'],
    format_duration: format_duration as ResolvedConfig['format_duration'],
    format_money: format_money as ResolvedConfig['format_money'],
    get_text: get_text as ResolvedConfig['get_text'],
  }

  // Bind format helpers to the config so they can read currency/timezone/messages.
  const ctx: FormatContext = config
  config.format_dt = (u.format_dt ?? format_dt).bind(ctx)
  config.format_duration = (u.format_duration ?? format_duration).bind(ctx)
  config.format_money = (u.format_money ?? format_money).bind(ctx)
  config.get_text = (u.get_text ?? get_text).bind(ctx)

  return { config, error }
}
