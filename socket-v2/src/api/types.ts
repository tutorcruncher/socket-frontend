/** Shapes returned by the Socket API. Derived from the legacy app's usage. */

export interface Subject {
  id: number
  name: string
}

export interface Skill {
  subject: string
  qual_levels: string[]
}

export interface ExtraAttribute {
  name: string
  type: 'text_short' | 'text_extended' | string
  value: string
}

export interface ContractorSummary {
  id: number
  name: string
  photo: string
  town: string | null
  distance: number | null
  tag_line: string | null
  primary_description: string | null
  link: string
  url: string
  review_rating: number | null
  review_duration: number | null
  skills?: Skill[]
  extra_attributes?: ExtraAttribute[]
}

export interface Contractor extends ContractorSummary {
  skills: Skill[]
  extra_attributes: ExtraAttribute[]
}

export interface LocationInfo {
  pretty: string | null
  error: 'rate_limited' | 'no_results' | null
}

export interface ContractorListResponse {
  count: number
  results: ContractorSummary[]
  location?: LocationInfo
}

export interface Appointment {
  id: number
  start: string
  finish: string
  topic: string
  service_name: string
  service_colour: string
  price: number | null
  attendees_max: number | null
  attendees_count: number
  link: string
  service_extra_attributes?: ExtraAttribute[]
}

export interface AppointmentListResponse {
  count: number
  results: Appointment[]
}

/** SSO session payload stored in sessionStorage under `_tcs_user_data_`. */
export interface SsoArgs {
  sso_data: string
  [key: string]: string
}

/** Decoded `sso_data`: the signed-in user's name and their students. */
export interface SessionData {
  nm: string
  srs: Record<string, string>
}

export interface CheckClientResponse {
  appointment_attendees: Record<number, number[]>
}

export type EnquiryFieldType =
  | 'text'
  | 'email'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'datetime'
  | 'integer'

export interface EnquiryFieldChoice {
  value: string
  display_name: string
}

export interface EnquiryField {
  type: EnquiryFieldType
  field: string
  label: string
  required: boolean
  help_text?: string
  help_class?: string
  max_length?: number
  choices?: EnquiryFieldChoice[]
  prefix?: string
}

export interface EnquiryFormInfo {
  visible: EnquiryField[]
}
