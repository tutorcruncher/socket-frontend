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

/**
 * A written review. **V2 contract: not yet served by the live API.**
 * See ROADMAP §3.1; until the backend ships it, the mock API supplies these.
 */
export interface Review {
  id: number
  author: string
  rating: number
  body: string
  /** UTC timestamp without a trailing `Z`, matching the rest of the API. */
  created: string
  /** Which service the review is about, e.g. "GCSE Maths". Optional. */
  service?: string | null
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
  /**
   * How many people reviewed. **V2 contract (ROADMAP §3.1).** Distinct from
   * `review_duration`, which is hours tutored: a prospect wants the count.
   */
  review_count?: number | null
  /**
   * Lowest hourly charge rate, in the tenant's currency. **V2 contract (§3.2).**
   * Render with `config.format_money`.
   */
  rate_from?: number | null
  /** Whether the tutor teaches online. **V2 contract (§3.2).** */
  remote?: boolean | null
  /** ISO datetime of the next free slot, or null if none. **V2 contract (§3.2).** */
  next_available?: string | null
  skills?: Skill[]
  extra_attributes?: ExtraAttribute[]
}

export interface Contractor extends ContractorSummary {
  skills: Skill[]
  extra_attributes: ExtraAttribute[]
  /** Most recent written reviews. **V2 contract (§3.1).** */
  reviews?: Review[]
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

/**
 * How a lesson is delivered. **V2 contract: not yet served by the live API.**
 * See ROADMAP §3.3; until the backend ships it, the mock API supplies these.
 */
export type DeliveryMode = 'online' | 'in_person'

/** A geocoded place. Present on in-person lessons; absent for online. */
export interface Address {
  /** Display name, e.g. "Ridley Room, 12 Rosebery Ave, London EC1R 4TD". */
  pretty: string
  line1?: string
  city?: string
  postcode?: string
  lat: number
  lng: number
}

/** Echoed back when the caller searched by location, mirroring /contractors. */
export interface SearchedLocation {
  pretty: string | null
  lat?: number
  lng?: number
  error?: 'rate_limited' | 'no_results' | null
}

export interface Appointment {
  id: number
  start: string
  finish: string
  topic: string
  service_id: number
  service_name: string
  service_colour: string
  price: number | null
  attendees_max: number | null
  attendees_count: number
  link: string
  /** Free-text venue/room name, e.g. "Latimer Room [Downstairs]". May be empty. */
  location?: string | null
  service_extra_attributes?: ExtraAttribute[]

  // --- V2 contract (mocked until the backend ships it) ---
  /** How the lesson is delivered. Absent on legacy payloads → treated as in_person. */
  delivery?: DeliveryMode
  /** Geocoded venue. Present when delivery === 'in_person'. */
  address?: Address | null
  /** Metres from the searched location; null when no location was searched. */
  distance?: number | null
}

export interface AppointmentListResponse {
  count: number
  results: Appointment[]
  /** Echoed geocoding result when `location` was passed. V2 contract. */
  location?: SearchedLocation | null
}

/** A bookable lesson type from GET /{key}/services. */
export interface Service {
  id: number
  name: string
  colour: string
  extra_attributes?: ExtraAttribute[]
  /** Delivery modes this service is offered in. V2 contract. */
  delivery_modes?: DeliveryMode[]
  /** Marketing photo shown in the booking summary rail. V2 contract. */
  photo?: string | null
  /** Short blurb shown under the service name in the summary rail. V2 contract. */
  description?: string | null
  /**
   * Subject shared by every tutor's version of this lesson type, so the booking
   * search can offer "GCSE Maths" once rather than one entry per tutor. V2 contract.
   */
  subject?: { id: number; name: string } | null
  /**
   * Tutor who teaches this lesson type, when it belongs to one. `photo` puts a face
   * on each bookable lesson. V2 contract.
   */
  contractor?: { id: number; name: string; photo?: string | null } | null
}

export interface ServiceListResponse {
  count?: number
  results: Service[]
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

// ---------------------------------------------------------------------------
// Payments & booking management: V2 contract (mocked; see ROADMAP §3.5)
// ---------------------------------------------------------------------------

/** Payment configuration served by /{key}/options. */
export interface PaymentConfig {
  /** When false the widget books without taking payment (today's behaviour). */
  required: boolean
  provider: 'stripe'
  /** Stripe publishable key: safe to expose; never the secret key. */
  publishable_key?: string
  /** Charge the full lesson price or a fixed deposit. */
  mode?: 'full' | 'deposit'
  deposit_amount?: number
  /** Optional cancellation/refund policy shown at checkout. */
  cancellation_policy?: string
  cancellation_policy_url?: string
}

/** A card the client has previously saved. */
export interface SavedCard {
  id: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
}

/** Response to POST /{key}/booking-intent: seat reserved, payment pending. */
export interface BookingIntent {
  booking_id: string
  /** Stripe PaymentIntent client secret; absent when no payment is required. */
  client_secret?: string
  amount: number
  /** ISO timestamp after which the held seat is released. */
  expires_at: string
  saved_cards?: SavedCard[]
}

/** Response to POST /{key}/booking-confirm. */
export interface BookingConfirmation {
  booking_id: string
  status: 'confirmed'
  appointment: number
  student_name: string
  amount_paid: number
  /** Set when the booking created a new client account. */
  account_created?: boolean
  receipt_url?: string
}

/** An upcoming lesson the signed-in client has booked. */
export interface ClientBooking {
  booking_id: string
  appointment: number
  service_name: string
  service_colour: string
  student_name: string
  start: string
  finish: string
  delivery?: DeliveryMode
  address?: Address | null
  price: number | null
  /** False when the cancellation window has passed. */
  can_cancel: boolean
  cancellation_deadline?: string
  /** Tutor teaching the lesson, when there is one. V2 contract. */
  contractor?: { id: number; name: string; photo?: string | null } | null
}

/**
 * A package a client can buy: prepaid account credit, as TutorCruncher's `Package`
 * model has it. The client pays `cost` and receives `cost + bonus_credit` to spend
 * on lessons. **V2 contract: mocked** (TC only sells these to signed-in clients).
 */
export interface CreditPackage {
  id: number
  name: string
  /** Markdown, written by the agency for clients browsing packages. */
  description?: string | null
  /** Total the client pays, tax inclusive. */
  cost: number
  bonus_credit: number
  /** Font Awesome name in TC; the widget has no icon font and shows a coloured tile. */
  icon?: string | null
  icon_colour?: string | null
}

export interface PackageListResponse {
  results: CreditPackage[]
}

/** Response to POST /{key}/package-intent. The amount is the server's, never the client's. */
export interface PackageIntent {
  purchase_id: string
  amount: number
  client_secret?: string
  saved_cards?: SavedCard[]
}

/** Response to POST /{key}/package-confirm. */
export interface PackageConfirmation {
  purchase_id: string
  status: 'paid'
  package: number
  amount_paid: number
  credit_added: number
  account_created?: boolean
  receipt_url?: string
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
