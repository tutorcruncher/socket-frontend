/**
 * Mock layer for the **V2 appointments contract** that the backend has not built yet.
 *
 * Why this exists: the live API models neither delivery mode (online / in-person /
 * home visit) nor geocoded appointment addresses: `location` is just a free-text
 * room name, and `?location=`/`?remote=` params are silently ignored. Rather than
 * design the booking UI around today's limitations, we build against the contract we
 * want and simulate it here.
 *
 * **Swapping to the real backend:** set `VITE_USE_MOCK_API=false` (or remove it).
 * Nothing else changes: components and queries already speak the V2 contract; this
 * file is the only thing that goes away. See ROADMAP §3.3 for the API spec.
 *
 * Real `start`/`finish`/`price`/`service` data is preserved and only the missing V2
 * fields are synthesised, so the UI is exercised against realistic scheduling data.
 */
import type {
  Address,
  Appointment,
  AppointmentListResponse,
  ClientBooking,
  ContractorListResponse,
  ContractorSummary,
  DeliveryMode,
  PaymentConfig,
  Review,
  SavedCard,
  SearchedLocation,
  Service,
  SessionData,
  SsoArgs,
} from './types'

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

/** Deterministic hash so a given appointment always gets the same mock attributes. */
const hash = (n: number) => {
  let h = (n ^ 0x9e3779b9) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** Plausible London venues for in-person lessons. */
const VENUES: Address[] = [
  { pretty: 'Rosebery Studio, 12 Rosebery Ave, London EC1R 4TD', line1: '12 Rosebery Ave', city: 'London', postcode: 'EC1R 4TD', lat: 51.5266, lng: -0.1093 },
  { pretty: 'Highgate Learning Rooms, 4 South Grove, London N6 6BS', line1: '4 South Grove', city: 'London', postcode: 'N6 6BS', lat: 51.5716, lng: -0.1478 },
  { pretty: 'Clapham Study Centre, 88 Venn St, London SW4 0AT', line1: '88 Venn St', city: 'London', postcode: 'SW4 0AT', lat: 51.4626, lng: -0.1379 },
  { pretty: 'Stratford Annexe, 3 Great Eastern Rd, London E15 1BB', line1: '3 Great Eastern Rd', city: 'London', postcode: 'E15 1BB', lat: 51.5423, lng: -0.0022 },
]

/** Distribution: ~55% online, ~45% in-person. */
function mockDelivery(id: number): DeliveryMode {
  return hash(id) % 100 < 55 ? 'online' : 'in_person'
}

/** Great-circle distance in metres. */
export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}

/** A few well-known UK places so the demo's address box does something believable. */
const GAZETTEER: Array<{ match: RegExp; place: SearchedLocation }> = [
  { match: /^(ec1|clerkenwell|farringdon|islington)/i, place: { pretty: 'Clerkenwell, London', lat: 51.5237, lng: -0.1055 } },
  { match: /^(n6|highgate)/i, place: { pretty: 'Highgate, London', lat: 51.5716, lng: -0.1478 } },
  { match: /^(sw4|clapham)/i, place: { pretty: 'Clapham, London', lat: 51.4626, lng: -0.1379 } },
  { match: /^(e15|stratford)/i, place: { pretty: 'Stratford, London', lat: 51.5423, lng: -0.0022 } },
  { match: /^(m1|manchester)/i, place: { pretty: 'Manchester, UK', lat: 53.4808, lng: -2.2426 } },
  { match: /(london|wc|w1|se1|nw1)/i, place: { pretty: 'London, UK', lat: 51.5072, lng: -0.1276 } },
]

const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})?$/i

/**
 * Demo geocoder. Known places resolve to their real coordinates; anything else
 * gets a stable made-up point within ~15 km of central London, so any postcode
 * or town a visitor types produces distances and a working radius filter. The
 * real API geocodes properly and can return `no_results`.
 */
export function geocode(query: string): SearchedLocation {
  const q = query.trim()
  if (!q) return { pretty: null }
  for (const g of GAZETTEER) {
    if (g.match.test(q)) return { ...g.place, pretty: g.place.pretty }
  }
  const pc = q.match(UK_POSTCODE)
  const pretty = pc
    ? `${pc[1].toUpperCase()}${pc[2] ? ' ' + pc[2].toUpperCase() : ''}`
    : q.replace(/\b\w/g, (c) => c.toUpperCase())
  // Same input, same point: the outward code (or the whole town name) seeds it.
  const seed = nameId((pc ? pc[1] : q).toLowerCase())
  const angle = (seed % 360) * (Math.PI / 180)
  const km = 2 + ((seed >>> 9) % 130) / 10
  return {
    pretty: pc ? `${pretty}, London` : `${pretty}, UK`,
    lat: 51.5072 + (km * Math.cos(angle)) / 111,
    lng: -0.1276 + (km * Math.sin(angle)) / (111 * Math.cos((51.5072 * Math.PI) / 180)),
  }
}

/** Layer the V2 fields onto a real appointment, deterministically. */
export function enrichAppointment(apt: Appointment): Appointment {
  const delivery = mockDelivery(apt.id)
  const address = delivery === 'in_person' ? VENUES[hash(apt.id) % VENUES.length] : null
  return {
    ...apt,
    delivery,
    address,
    // Home-visit tutors travel 5–15km.
    distance: null,
  }
}

export interface MockFilters {
  delivery?: DeliveryMode | null
  location?: string | null
  /** Search radius in metres. */
  radius?: number | null
}

/**
 * Apply the V2 filters the backend will eventually apply server-side:
 * delivery mode, and distance from a geocoded location.
 *
 * Online lessons always match a location search: they have no geography, and
 * excluding them would be wrong (a parent searching "near me" still wants them).
 */
export function applyMockFilters(
  response: AppointmentListResponse,
  filters: MockFilters,
): AppointmentListResponse {
  let results = response.results.map(enrichAppointment)
  let searched: SearchedLocation | null = null

  if (filters.delivery) {
    results = results.filter((a) => a.delivery === filters.delivery)
  }

  if (filters.location) {
    searched = geocode(filters.location)
    if (searched.lat !== undefined && searched.lng !== undefined) {
      const origin = { lat: searched.lat, lng: searched.lng }
      const radius = filters.radius ?? 25000
      results = results
        .map((a) => {
          if (a.delivery === 'online') return { ...a, distance: null }
          const point = a.address ?? VENUES[hash(a.id) % VENUES.length]
          return { ...a, distance: haversine(origin, point) }
        })
        .filter((a) => a.delivery === 'online' || (a.distance ?? Infinity) <= radius)
    } else {
      // Geocoding failed: return nothing, matching how /contractors behaves.
      results = []
    }
  }

  return { count: results.length, results, location: searched }
}

/**
 * Payment config the mock reports via /options (ROADMAP §3.5). `publishable_key` is
 * deliberately absent so the payment step falls back to its simulated card form
 * rather than trying to load real Stripe Elements.
 */
export function mockPaymentConfig(): PaymentConfig | undefined {
  if (!USE_MOCK_API) return undefined
  return {
    // `provider` stays in both variants: buying a package always takes a card.
    required: paymentVariant === 'now',
    provider: 'stripe',
    mode: 'full',
    cancellation_policy:
      'Lessons can be cancelled free of charge up to 24 hours before the start time. ' +
      'Cancellations inside 24 hours are charged in full.',
  }
}

/**
 * Whether the mock tenant charges at booking (`now`) or invoices after the lesson
 * (`later`, what TutorCruncher does today). Set by the demo page before a widget
 * mounts; a real tenant's setting arrives with /options and is not the host's to choose.
 */
export type MockPaymentVariant = 'now' | 'later'
let paymentVariant: MockPaymentVariant = 'now'
export function setMockPaymentVariant(variant: MockPaymentVariant): void {
  paymentVariant = variant
}

/** Cards a returning client has on file. */
const MOCK_SAVED_CARDS: SavedCard[] = [
  { id: 'pm_mock_visa', brand: 'Visa', last4: '4242', exp_month: 4, exp_year: 2029 },
]

const delay = <T>(value: T, ms: number): Promise<{ status: number; data: T }> =>
  new Promise((resolve) => setTimeout(() => resolve({ status: 201, data: value }), ms))

let bookingSeq = 1

/** In-memory store of bookings made this session, for "manage my bookings". */
const mockBookings: ClientBooking[] = []

export function getMockBookings(): ClientBooking[] {
  return mockBookings
}

export function cancelMockBooking(id: string): boolean {
  const i = mockBookings.findIndex((b) => b.booking_id === id)
  if (i === -1) return false
  mockBookings.splice(i, 1)
  return true
}

/** Register a confirmed booking so it shows up under "my bookings". */
export function recordMockBooking(b: ClientBooking): void {
  mockBookings.unshift(b)
}

/*
 * Demo sign-in. With the mock on, "Sign in" skips the SSO popup and signs the
 * visitor in as this client, so the signed-in flow (student picker, saved card,
 * "already attending", My bookings) can be demoed without a TutorCruncher login.
 */
export const MOCK_SESSION: SessionData = {
  nm: 'Chris Stanlake',
  srs: { '9001': 'Sam Stanlake', '9002': 'Ada Stanlake' },
}
export const MOCK_SSO_ARGS: SsoArgs = { sso_data: JSON.stringify(MOCK_SESSION), signature: 'mock' }

let seededBooking = false

/** Give the demo client one upcoming lesson, so My bookings is not empty on sign-in. */
export async function seedMockClientBooking(): Promise<void> {
  if (seededBooking) return
  seededBooking = true
  const tutors = (await tutorsPromise) ?? []
  const soon = Date.now() + 2 * 86_400_000
  const apt = mockBusyAppointments(tutors).find(
    (a) =>
      new Date(`${a.start}Z`).getTime() > soon &&
      (a.attendees_max === null || a.attendees_count < a.attendees_max),
  )
  if (!apt) return
  const enriched = enrichAppointment(apt)
  mockBookings.push({
    booking_id: 'bk_mock_seed',
    appointment: apt.id,
    service_name: apt.service_name,
    service_colour: apt.service_colour,
    student_name: MOCK_SESSION.srs['9002'],
    start: apt.start,
    finish: apt.finish,
    delivery: enriched.delivery,
    address: enriched.address,
    price: apt.price,
    can_cancel: true,
    contractor: busyServices(tutors).find((svc) => svc.id === apt.service_id)?.contractor ?? null,
  })
}

/** Lessons the demo client's students are on: appointment id -> student ids. */
export function mockAttendees(): Record<number, number[]> {
  const idByName = new Map(Object.entries(MOCK_SESSION.srs).map(([id, name]) => [name, Number(id)]))
  const out: Record<number, number[]> = {}
  for (const b of mockBookings) {
    const id = idByName.get(b.student_name)
    if (id) (out[b.appointment] ??= []).push(id)
  }
  return out
}

/** Signing out of the demo client forgets their bookings. */
export function clearMockBookings(): void {
  mockBookings.length = 0
  seededBooking = false
}

/**
 * Intercept POSTs to endpoints the backend hasn't built yet.
 * Returns null for anything real, so the request falls through to the live API.
 */
export function mockPost<T>(
  path: string,
  data: unknown,
): Promise<{ status: number; data: T }> | null {
  if (!USE_MOCK_API) return null
  const body = (data ?? {}) as Record<string, unknown>

  if (path === 'book-appointment-guest') {
    // Legacy no-payment path (ROADMAP §3.4), kept for payment-optional tenants.
    console.debug('[socket:mock] book-appointment-guest', data)
    return delay({ status: 'ok', created: true } as T, 700)
  }

  if (path === 'booking-intent') {
    // Reserve the seat and open a PaymentIntent. The real endpoint returns a Stripe
    // client_secret; the mock omits it so the UI uses its simulated card form.
    console.debug('[socket:mock] booking-intent', data)
    const amount = typeof body.amount === 'number' ? body.amount : 0
    return delay(
      {
        booking_id: `bk_mock_${bookingSeq++}`,
        amount,
        expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
        // Saved cards are only offered to a signed-in client.
        saved_cards: body.client_email ? [] : MOCK_SAVED_CARDS,
      } as T,
      600,
    )
  }

  if (path === 'booking-confirm') {
    console.debug('[socket:mock] booking-confirm', data)
    // Stripe's canonical decline-test card, so the failure path is testable.
    const card = String(body.card_number ?? '').replace(/\s/g, '')
    if (card === '4000000000000002') {
      return new Promise((_, reject) =>
        setTimeout(
          () =>
            reject({
              msg: 'Your card was declined. Please try a different payment method.',
              url: 'booking-confirm',
              status: 402,
            }),
          900,
        ),
      )
    }
    return delay(
      {
        booking_id: String(body.booking_id ?? ''),
        status: 'confirmed',
        appointment: Number(body.appointment ?? 0),
        student_name: String(body.student_name ?? ''),
        amount_paid: Number(body.amount ?? 0),
        account_created: Boolean(body.client_email),
        // Nothing charged, nothing to receipt.
        ...(Number(body.amount ?? 0) > 0
          ? { receipt_url: 'https://example.com/receipt/mock' }
          : {}),
      } as T,
      900,
    )
  }

  if (path.startsWith('bookings/') && path.endsWith('/cancel')) {
    const id = path.split('/')[1]
    console.debug('[socket:mock] cancel booking', id)
    const ok = cancelMockBooking(id)
    return delay({ status: ok ? 'cancelled' : 'not_found' } as T, 600)
  }

  return null
}

/* ============================================================
   Contractor V2 fields: reviews, rates, availability (ROADMAP §3.1 / §3.2)
   ============================================================ */

/**
 * `Date.now()` read once at module load. The mock must not shift underneath a
 * render: a review date or "next available" that moves between renders would make
 * list ordering and React keys unstable.
 */
const MOCK_NOW = Date.now()

const REVIEW_AUTHORS = [
  'Sarah M.', 'James T.', 'Priya K.', 'Daniel O.', 'Emma R.',
  'Tom H.', 'Aisha B.', 'Michael C.', 'Laura W.', 'Ben F.',
]

const REVIEW_BODIES = [
  'Explains things in a way that finally made sense to my daughter. Her confidence has come on hugely.',
  'Really patient and well prepared. Turns up with a plan every week rather than winging it.',
  'My son went up two grades in a term. Worth every penny.',
  'Friendly and calm, which matters a lot with an anxious teenager. Would recommend.',
  'Very good at spotting the gaps rather than just re-teaching what he already knew.',
  'Flexible with timings and always replies quickly. Lessons are well structured.',
  'Made a subject my daughter dreaded into something she actually looks forward to.',
  'Clear feedback after every session so we knew exactly what to practise.',
]

const REVIEW_SERVICES = [
  'GCSE Maths', 'A-level Physics', 'GCSE English', 'KS3 Science',
  '11+ Preparation', 'A-level Chemistry', 'GCSE Spanish',
]

/**
 * Written reviews for a contractor. Count and content are derived from the id so a
 * given tutor always shows the same reviews, and the rating hovers near the tutor's
 * real `review_rating` so the stars and the text agree.
 */
export function mockReviews(id: number, rating: number | null): Review[] {
  const h = hash(id)
  // ~15% of tutors have no reviews, so the empty state is exercised.
  if (h % 100 < 15) return []
  const count = 2 + (h % 3)
  const base = typeof rating === 'number' ? rating : 4.6
  // Walk the body/author lists with a per-tutor offset and stride rather than
  // hashing each index independently: independent hashes collide, and the same
  // review text appearing twice on one profile reads as broken, not synthetic.
  const bodyStart = h % REVIEW_BODIES.length
  // An odd stride is coprime with the (power-of-two) list length, so stepping by it
  // visits distinct entries. An even stride would revisit and duplicate.
  const bodyStride = 1 + 2 * ((h >>> 8) % (REVIEW_BODIES.length / 2))
  const authorStart = (h >>> 4) % REVIEW_AUTHORS.length
  return Array.from({ length: count }, (_, i) => {
    const hi = hash(id * 31 + i)
    // Keep individual ratings within 1 star of the average, clamped to 3..5.
    const offset = (hi % 3) - 1
    return {
      id: id * 100 + i,
      author: REVIEW_AUTHORS[(authorStart + i) % REVIEW_AUTHORS.length],
      rating: Math.max(3, Math.min(5, Math.round(base) + offset)),
      body: REVIEW_BODIES[(bodyStart + i * bodyStride) % REVIEW_BODIES.length],
      // Spread over roughly the last year, newest first. Emitted without the `Z`
      // suffix to match the rest of the API: `format_dt` appends it itself.
      created: new Date(MOCK_NOW - (i * 26 + (hi % 21)) * 86_400_000)
        .toISOString()
        .replace('Z', ''),
      service: REVIEW_SERVICES[(hi >>> 7) % REVIEW_SERVICES.length],
    }
  })
}

/** Hourly rates cluster at realistic UK tutoring price points. */
const RATE_POINTS = [30, 35, 40, 45, 50, 55, 60, 70, 80]

/**
 * Layer the V2 contractor fields onto a real contractor, deterministically:
 * review count, headline rate, online flag, and next free slot.
 */
export function enrichContractor<T extends ContractorSummary>(c: T): T {
  const h = hash(c.id)
  const reviews = mockReviews(c.id, c.review_rating)
  // ~70% of tutors teach online.
  const remote = h % 10 < 7
  // A quarter have nothing free in the next fortnight.
  // Land on a clean hour in the 9am–8pm teaching window: a "next available" of
  // 8:54 PM reads as generated data rather than a real timetable slot.
  // No trailing `Z`: the API serves naked UTC and `format_dt` appends it itself.
  let nextAvailable: string | null = null
  if (h % 4 !== 0) {
    const day = new Date(MOCK_NOW + (1 + (h % 14)) * 86_400_000)
    day.setUTCHours(9 + ((h >>> 5) % 12), 0, 0, 0)
    nextAvailable = day.toISOString().replace('Z', '')
  }
  return {
    ...c,
    review_count: reviews.length,
    rate_from: RATE_POINTS[h % RATE_POINTS.length],
    remote,
    next_available: nextAvailable,
  }
}

/** Contractor list enrichment, plus the V2 filters the backend will apply server-side. */
export interface MockContractorFilters {
  /** Only tutors who teach online. */
  remote?: boolean | null
  /** Inclusive hourly-rate bounds, in the tenant's currency. */
  rate_min?: number | null
  rate_max?: number | null
}

export function applyMockContractorFilters(
  response: ContractorListResponse,
  filters: MockContractorFilters,
): ContractorListResponse {
  let results = response.results.map(enrichContractor)
  if (filters.remote) results = results.filter((c) => c.remote)
  if (typeof filters.rate_min === 'number') {
    results = results.filter((c) => (c.rate_from ?? 0) >= filters.rate_min!)
  }
  if (typeof filters.rate_max === 'number') {
    // Exclusive upper bound so adjacent bands don't overlap: with `<=`, a £40 tutor
    // would appear under both "Under £40" and "£40–£60".
    results = results.filter((c) => (c.rate_from ?? Infinity) < filters.rate_max!)
  }
  // `count` is the server's total across all pages; filtering client-side can only
  // shrink the current page, so report the filtered length to keep pagination honest.
  return { ...response, count: results.length, results }
}

/**
 * Plausible service blurbs for the booking summary rail. Real tenants will author
 * these per service; picked by id hash so each service keeps the same copy.
 */
const SERVICE_BLURBS = [
  'A friendly, structured session led by one of our experienced tutors. Every lesson is tailored to the student’s level and pace.',
  'Small-group teaching that keeps every student engaged. We track progress each week and share it with you after the lesson.',
  'One-to-one support focused on building confidence as much as ability. Ideal for exam preparation or catching up on tricky topics.',
]

/** Services gain the delivery modes they're offered in, plus a photo and blurb. */
/**
 * Real contractors on the tenant, used to give mock services a tutor whose profile
 * actually opens. Fetched once and shared, so services and appointments agree on
 * who teaches what.
 */
let tutorsPromise: Promise<ContractorSummary[]> | null = null
export function loadMockTutors(fetchList: () => Promise<ContractorSummary[]>) {
  tutorsPromise ??= fetchList().catch(() => [])
  return tutorsPromise
}

export function enrichServices(services: Service[], tutors: ContractorSummary[]): Service[] {
  return services.map((s): Service => {
    // Some services are online-only; the rest offer both.
    const delivery_modes: DeliveryMode[] =
      hash(s.id) % 3 === 0 ? ['online'] : ['online', 'in_person']
    return {
      ...s,
      delivery_modes,
      // No placeholder: the real API serves no service photo, and the rail leads
      // with the tutor's photo instead.
      photo: s.photo ?? null,
      description: s.description ?? SERVICE_BLURBS[hash(s.id) % SERVICE_BLURBS.length],
      ...splitServiceName(s, tutors),
    }
  }).concat(busyServices(tutors))
}

/** Stable numeric id for a subject name, so services sharing a subject share an id. */
const nameId = (name: string) => {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) >>> 0
  return h
}

/**
 * TC names services "<subject> with <tutor>" by convention; the mock recovers the
 * subject and tutor from that, linking the tutor to a real contractor with the same
 * first name so their profile opens. The real API should send both as fields, since
 * the naming convention is not enforced.
 */
function splitServiceName(
  s: Service,
  tutors: ContractorSummary[],
): Pick<Service, 'subject' | 'contractor'> {
  const m = s.name.match(/^(.+?) with (.+)$/)
  const subject = m ? m[1] : s.name
  const first = m?.[2].split(/\s+/)[0].toLowerCase()
  const tutor = first ? tutors.find((t) => t.name.split(/\s+/)[0].toLowerCase() === first) : undefined
  return {
    subject: s.subject ?? { id: nameId(subject), name: subject },
    contractor:
      s.contractor ?? (tutor ? { id: tutor.id, name: tutor.name, photo: tutor.photo } : null),
  }
}

/*
 * Busy subject. The demo branch has one tutor per subject and a few lessons a week,
 * which hides how the booking flow behaves for a large agency. This adds one
 * synthetic subject taught by eight of the tenant's real tutors with several lessons
 * a day each, enough to overflow the calendar's fetch cap and fill a day with dozens
 * of times.
 */
const BUSY_SUBJECT = { id: 990000, name: 'GCSE Maths' }
// Fallback names when the contractor list can't be loaded.
const BUSY_TUTORS = ['Amara', 'Ben', 'Chloe', 'Dev', 'Ellie', 'Farid', 'Grace', 'Hugo']
const BUSY_COLOURS = ['#2563eb', '#16a34a', '#db2777', '#ea580c', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626']
const BUSY_HOURS = [9, 10, 11, 13, 14, 15, 16, 17, 18, 19]

function busyServices(tutors: ContractorSummary[]): Service[] {
  return BUSY_TUTORS.map((fallback, i) => {
    const tutor = tutors[i]
    const name = tutor?.name ?? fallback
    return {
      id: BUSY_SUBJECT.id + i + 1,
      name: `${BUSY_SUBJECT.name} with ${name}`,
      colour: BUSY_COLOURS[i],
      delivery_modes: ['online', 'in_person'] as DeliveryMode[],
      photo: null,
      description: SERVICE_BLURBS[i % SERVICE_BLURBS.length],
      subject: BUSY_SUBJECT,
      contractor: tutor ? { id: tutor.id, name: tutor.name, photo: tutor.photo } : null,
    }
  })
}

export const isMockBusyService = (id: number) =>
  id > BUSY_SUBJECT.id && id <= BUSY_SUBJECT.id + BUSY_TUTORS.length

/** Next 120 days of lessons for the busy subject, deterministic per tutor and day. */
export function mockBusyAppointments(tutors: ContractorSummary[]): Appointment[] {
  const services = busyServices(tutors)
  const out: Appointment[] = []
  const start = new Date(MOCK_NOW)
  start.setUTCHours(0, 0, 0, 0)
  for (let d = 0; d < 120; d++) {
    const day = new Date(start.getTime() + d * 86_400_000)
    services.forEach((svc, t) => {
      const h = hash(d * 97 + t)
      // Each tutor works about 5 days in 7, taking 2 to 4 lessons a day.
      if (h % 7 >= 5) return
      const count = 2 + (h % 3)
      const offset = (h >>> 4) % BUSY_HOURS.length
      for (let k = 0; k < count; k++) {
        const hour = BUSY_HOURS[(offset + k * 3) % BUSY_HOURS.length]
        const from = new Date(day)
        from.setUTCHours(hour, 0, 0, 0)
        // Keep today's already-started lessons out of the calendar.
        if (from.getTime() < MOCK_NOW) continue
        const to = new Date(from.getTime() + 3_600_000)
        const id = svc.id * 1000 + d * 10 + k
        out.push({
          id,
          link: `${id}-${svc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          topic: `${BUSY_SUBJECT.name} lesson`,
          start: from.toISOString().replace('Z', ''),
          finish: to.toISOString().replace('Z', ''),
          price: 50 + (t % 3) * 5,
          attendees_max: 4,
          attendees_count: hash(id) % 5,
          location: null,
          service_id: svc.id,
          service_name: svc.name,
          service_colour: svc.colour,
          service_extra_attributes: [],
        })
      }
    })
  }
  return out.sort((a, b) => a.start.localeCompare(b.start))
}
