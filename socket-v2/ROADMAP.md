# Socket v2: Roadmap & Next Steps

A living document. Update it as work lands. Companion to [README.md](./README.md).

**What Socket is for:** it's a lead-gen surface embedded on a tutoring agency's own
website. Its job is turning visitors into **enquiries and bookings**. Prioritise by
(a) conversion lift and (b) reach.

---

## 1. Status

| Area | State |
|---|---|
| Core embed (`window.socket`), config, options merge | ✅ |
| Design system (UI2 tokens, Tailwind v4, scoped to `.tcs-root`) | ✅ |
| Contractors (`tutors` mode, in-widget grid/list toggle, subject + location filters, pagination, profile modal, stars) | ✅ verified vs live API |
| Reviews, rates, availability + online/price filters (§3.1, §3.2) | 🔨 UI built, on mock: awaiting backend |
| Enquiry (dynamic schema form, plain + modal + contractor-prefilled) | ✅ (captcha not wired: see 2.1) |
| Appointments (search-first flow: lesson-type + venue search → month calendar with next-available jump → inline booking panel) | ✅ rebuilt & verified vs live API; flow past SSO sign-in untested (needs real credentials) |
| Routing (`hash` default, `memory` for plain enquiry; `history` removed) | ✅ |
| Bundle size | ✅ 243 → **~72 kB gzip** (preact/compat, custom Combobox, no Sentry SDK) |
| UX polish (skeletons, photo fallbacks, focus-trap, reduced-motion) | ✅ |
| Accessibility audit (contrast, focus rings, hit areas, heading order) | ✅ |
| Tests | ❌ none |

---

## 2. Known issues / gaps (no backend needed)

Small, real, and currently broken or missing. Cheapest wins on the board.

### 2.1 reCAPTCHA is not wired: enquiry posts with no token
`grecaptcha_key` is plumbed through `buildConfig` and a `grecaptcha_missing` string
exists, but **nothing ever loads or verifies grecaptcha**. Public enquiry forms are
spam magnets.
- [ ] Load grecaptcha (v2 checkbox or v3 invisible) when `config.grecaptcha_key` is set
- [ ] Block submit + show `grecaptcha_missing` when absent
- [ ] Add a honeypot field as a cheap second layer
- **Files:** `components/enquiry/EnquiryForm.tsx`, `config/buildConfig.ts`

### 2.2 `distance_units`: ✅ DONE
`/options` returns `distance_units: "miles"` for some tenants (Dino Tutors does); the
widget used to hardcode km. `lib/delivery.ts` now provides `formatDistance()` /
`formatDistanceShort()`, used by both the appointments flow and contractor cards.

### 2.3 Analytics is dead: Universal Analytics was sunset (July 2023)
The legacy widget pushed pageviews/events to `window.ga` (Universal Analytics), which
Google shut down. v2 dropped it entirely, so **Socket currently reports nothing**.
- [ ] Emit to GA4 via `gtag`/`dataLayer` if present on the host page
- [ ] Keep the existing `config.event_callback` hook as the neutral escape hatch
- [ ] Events: `view_tutor`, `open_enquiry`, `submit_enquiry`, `view_appointment`, `book_appointment`
- **Files:** new `lib/analytics.ts`, `lib/useEventCallback.ts`

### 2.4 No tests
- [ ] Vitest for `buildConfig` (options merge, router coercion), formatting, route parsing

---

## 3. Prioritised features

### 3.1 Written reviews, not just a star count  🔨 UI BUILT, AWAITING BACKEND

**Status: the frontend is finished and running against the mock.** `Review` is defined
in `api/types.ts`, `components/contractors/Reviews.tsx` renders them on the profile,
and `ui/Stars.tsx` now prefers `review_count` over the ambiguous "(14 hours)", falling
back to hours when no count is served. Ships the moment the contract below lands:
no component changes needed.

**Problem.** The contractor payload exposes only `review_rating` (a number) and
`review_duration` (seconds of lessons reviewed, rendered as "(14 hours)"). There is
**no review text and no review count**. "(14 hours)" is hours tutored, not how many
people reviewed, which is the number a prospect actually cares about.

Social proof is the single highest-leverage element on a "choose a tutor" page, and
TC already collects reviews.

**Needs API work.** Either extend `GET /{key}/contractors/{id}`:
```jsonc
"reviews": [
  { "author": "Sarah M.", "rating": 5, "body": "…", "created": "2026-05-02", "service": "GCSE Maths" }
],
"review_count": 12
```
…or add `GET /{key}/contractors/{id}/reviews?limit=3`.

**UI: built**
- [x] Card: `★ 4.8 (12 reviews)`: swaps the ambiguous "(14 hours)" for a review count
- [x] Profile modal: most recent reviews, with author + service + date

**Acceptance:** rating, count and ≥1 review render on a tutor with reviews; tutors
with none degrade gracefully (no empty section).

---

### 3.2 Pricing & availability transparency  🔨 UI BUILT, AWAITING BACKEND

**Status: the frontend is finished and running against the mock.** Cards render
`rate_from`, an online badge and `next_available`; `RateAndRemoteFilters` adds the
online-only toggle and price bands. Every field is optional and each renders only
when present, so the widget is unchanged for tenants whose API serves none of them:
the filters hide themselves entirely rather than filtering to nothing.

**Problem.** Appointments carry a `price`, but **contractors carry no rate at all**,
and there is no availability anywhere. A prospect cannot see what a tutor costs or
when they're free without submitting an enquiry: a hard drop-off before any intent
is captured. TC knows both.

**Needs API work.** Add to the contractor payload:
```jsonc
"rate_from": 45.0,          // charge rate; render with existing options.currency
"remote": true,             // online vs in-person
"next_available": "2026-07-16T10:00:00"
```
And for the full picker, `GET /{key}/contractors/{id}/availability?from=&to=` → slots.

**UI: built**
- [x] Card: `from £45/hr` (uses `config.currency` + `format_money`)
- [x] Card: `Next available Thu 10:00` (relative for a week out, then `Aug 15`)
- [x] Filter: **Online only** toggle, and price bands (half-open, so no overlap)
- [ ] Profile modal: week-view availability grid (needs the availability endpoint)

**Ship value before real booking exists:** make a slot click open the **existing
enquiry form pre-filled with the chosen tutor + slot** (`contractor` is already a
supported enquiry field). Captures the lead without any booking backend.

**Acceptance:** rate + online flag render and are filterable; picking a slot produces
an enquiry carrying tutor and requested time.

> **Out of scope:** SEO / indexable tutor profiles (JSON-LD, SSR). Considered and
> explicitly dropped: Socket is not an acquisition channel for search.

---

### 3.3 Appointment delivery modes + geocoded addresses  🔨 UI BUILT, AWAITING BACKEND
**Status: the frontend is finished and running against a mock.** Set
`VITE_USE_MOCK_API=false` and delete `src/api/mock.ts` once the API below ships:
no component or query changes needed.

**Problem.** The live API cannot answer the two questions parents ask first:
*"can I do this online?"* and *"is it near me?"*

Verified against the live API:
- **No delivery concept anywhere.** No field on appointments, services or contractors
  distinguishes online / in-person / home visit.
- **`appointments[].location` is a free-text room name**: `"Latimer Room [Downstairs]"`,
  `"Ridley Room [Upstairs]"`, `"Room 101"`, some empty. No address, no lat/lng.
- **Appointment filter params are silently ignored.** `?location=`, `?remote=` and
  `?online=` all return the identical 289 results with `location: null`.
- By contrast **`/contractors` already geocodes properly**: `?location=London` returns
  `{"pretty":"London, UK","lat":51.5072,"lng":-0.1276}` plus a per-tutor `distance`.
  The appointments endpoint should match this behaviour.

**Requested contract**
```jsonc
// GET /{key}/appointments?delivery=&location=&radius=
{
  "count": 42,
  // echoed geocoding, exactly as /contractors already does
  "location": { "pretty": "Clerkenwell, London", "lat": 51.5237, "lng": -0.1055 },
  "results": [{
    // …existing fields…
    "delivery": "online" | "in_person" | "home_visit",
    "address": {                       // present when delivery === "in_person"
      "pretty": "Rosebery Studio, 12 Rosebery Ave, London EC1R 4TD",
      "line1": "12 Rosebery Ave", "city": "London", "postcode": "EC1R 4TD",
      "lat": 51.5266, "lng": -0.1093
    },
    "distance": 416,                   // metres from searched location; null if none
    "travel_radius": 10000             // home_visit only: how far the tutor travels
  }]
}

// GET /{key}/services
{ "results": [{ "id": 1, "name": "…", "delivery_modes": ["online", "in_person"] }] }
```

**Query params:** `delivery` (one of the three), `location` (free text to geocode),
`radius` (metres).

**Agreed semantics** (implemented in the mock, worth matching server-side):
- **Online lessons always match a location search**: they have no geography, and a
  parent searching "near me" still wants them.
- **Home visits match if `distance <= radius + travel_radius`**: the tutor comes to you.
- **Unresolvable location returns 0 results** with `location.error: "no_results"`,
  mirroring `/contractors`.

**Already built against this:** three-way delivery toggle, address + radius search,
per-service delivery modes, delivery badges and distances on slots, and delivery-aware
booking context ("No travel needed" / venue address / "Travels up to 10km").

---

### 3.4 Inline account creation (guest booking)  🔨 UI BUILT, AWAITING BACKEND
**Status: frontend finished, running against the mock in `api/mock.ts` (`mockPost`).**

**Problem.** The only way to book was the SSO popup: it throws the parent onto a
different website mid-flow, which is the single biggest drop-off in the funnel. A
first-time client has no account yet, so "Sign in to book" is a dead end for exactly
the people we most want to convert.

**The good news:** the backend already does 90% of this. `POST /{key}/enquiry`
**creates a client and a service recipient (student)** from `client_name`,
`client_email`, `client_phone`, `service_recipient_name`. We need the same identity
creation attached to a booking rather than an enquiry: a variant of an existing flow,
not a new identity system. (Probed: no `/register`, `/signup` or `/clients` endpoint
exists.)

**Requested endpoint**
```jsonc
// POST /{key}/book-appointment-guest    -> 201
{
  "appointment": 20744036,
  "client_name": "Chris Stanlake",
  "client_email": "chris@example.com",
  "client_phone": "020 7946 0000",      // optional
  "student_name": "Ada S",
  "upstream_http_referrer": "https://agency.com/book"
}
```
Behaviour: create (or match on email) the client, create the student, add them to the
lesson, and email a magic link so they can manage bookings later. Should honour the
same capacity rules as `book-appointment` and 400 with field errors on validation
failure (the UI already renders per-field errors).

**Built against this:** guest form is the *default* path with "Already have an
account? Sign in" falling back to SSO; required-field + email validation; pending
state; and a confirmation that tells them the account was created.

**No account step before browsing.** An earlier build opened on "Do you already
have an account?" with an email lookup. It was removed: it put a form in front of
every visitor, did not actually sign existing clients in (they still went through
SSO), discarded the email a new client typed, and needed a `lookup-client` endpoint
that reveals which emails are clients. The flow now opens on search; "Already a
client? Sign in" is offered on the search form, the calendar and the details step,
and the backend matches a guest's email to an existing client at booking.

**Demo sign-in.** With `VITE_USE_MOCK_API` on, "Sign in" skips the SSO popup and
signs in as a mock client (two students, one saved card, one upcoming lesson), so
the signed-in path can be demoed without a TutorCruncher login.

**Follow-ups worth considering:** reCAPTCHA on this endpoint (it's unauthenticated,
see §2.1), and rate limiting per email/IP.

---

### 3.5 Payment at booking  🔨 UI BUILT, AWAITING BACKEND
**Status: full checkout built and running against the mock. Flip
`VITE_USE_MOCK_API=false` and delete `api/mock.ts` once the endpoints below ship.**

**Decisions taken:** Stripe Elements inline (never a redirect), **pay-to-confirm** on
the full amount, seat held by a booking intent while the parent pays.

**Flow built:** `details → review → payment → confirmed`
- **details**: guest account creation, or student picker for signed-in clients
- **review**: order summary, cancellation policy, **terms acceptance gate** (blocks
  continue until ticked; taking money without showing the policy is a legal risk)
- **payment**: card fields, saved-card selection, "save this card", declined-card
  handling that keeps the parent on the step to retry
- **confirmed**: receipt, **.ics calendar invite** (verified valid RFC 5545), and
  account-created notice

**⚠️ Before go-live:** the current card form is a *simulated* one, clearly labelled
"Demo mode". It **must** be replaced with real Stripe Elements: mount
`@stripe/react-stripe-js` (lazy-loaded, ~+15 kB gzip, only for tenants that take
payment) using `client_secret` from `booking-intent`, so **raw card data never touches
our bundle or our servers**. `PaymentStep.tsx` already branches on
`config.payment.publishable_key` for exactly this.

**Investigation: the legacy widget never took payment either.** This is a genuinely
new capability, not a regression from v1:
- No `stripe|payment|card|checkout|charge|deposit|invoice` reference anywhere in the
  old `src/`.
- Legacy `book()` posts only `{appointment, student_id | student_name}` + SSO args.
- `apt.price` is **display-only** in all four places it appears.
- Every payment endpoint probed returns 404: `/payment`, `/payments`, `/stripe`,
  `/checkout`, `/pay`, `/payment-intent`, `/create-payment-intent`, `/card`, `/billing`.
- `/options` exposes only `currency: {code, symbol}`: no payment config, no publishable
  key, no "payment required" flag.

So booking has always meant *"reserve a place, get invoiced later via TutorCruncher
accounting"*. Taking money at the point of booking is new work.

**Requested contract**
```jsonc
// GET /{key}/options: tells the widget whether to collect payment at all.
// Omit or set required:false to keep today's invoice-later behaviour.
{ "payment": { "required": true, "provider": "stripe",
               "publishable_key": "pk_live_…",     // publishable only, never secret
               "mode": "full" | "deposit", "deposit_amount": 20.0,
               "cancellation_policy": "Free cancellation up to 24 hours before…",
               "cancellation_policy_url": "https://…" } }

// POST /{key}/booking-intent -> 201   reserve the seat + open a PaymentIntent
{ "appointment": 20744036, "amount": 60.0, "student_name": "Ada S",
  "student_id": 123,                                  // or guest client fields:
  "client_name": "…", "client_email": "…", "client_phone": "…" }
-> { "booking_id": "bk_…", "client_secret": "pi_…_secret_…", "amount": 60.0,
     "expires_at": "2026-08-03T14:10:00Z",            // seat released after this
     "saved_cards": [{ "id": "pm_…", "brand": "Visa", "last4": "4242",
                       "exp_month": 4, "exp_year": 2029 }] }

// POST /{key}/booking-confirm -> 201   after Stripe confirms the payment
{ "booking_id": "bk_…", "payment_intent": "pi_…", "save_card": true }
-> { "booking_id": "bk_…", "status": "confirmed", "appointment": 20744036,
     "student_name": "Ada S", "amount_paid": 60.0,
     "account_created": true, "receipt_url": "https://…" }
```

**Semantics to match** (implemented in the mock):
- **Pay-to-confirm**: the booking only exists after `booking-confirm`; an abandoned
  checkout must release the seat at `expires_at`.
- **Declines return 402** with a human-readable `msg`; the widget keeps the parent on
  the payment step to retry rather than dumping them back to the calendar.
- **Capacity is re-checked at confirm**: two parents can race for the last seat.
- `saved_cards` only for an authenticated client; never expose one client's cards to
  another.

**Also needed:** reCAPTCHA on `booking-intent` (unauthenticated: see §2.1) and
per-email/IP rate limiting.

---

### 3.6 Manage my bookings  🔨 UI BUILT, AWAITING BACKEND
**Status: built against the mock store; needs real endpoints.**

Parents can view upcoming lessons and cancel them in the widget, instead of emailing
the agency or logging into TutorCruncher.

```jsonc
// GET /{key}/bookings           (authenticated: SSO args or magic-link session)
-> { "results": [{ "booking_id": "bk_…", "appointment": 20744036,
       "service_name": "GCSE English with Jennifer", "service_colour": "#ff4500",
       "student_name": "Ada S", "start": "…", "finish": "…",
       "delivery": "online", "address": null, "price": 60.0,
       "can_cancel": true, "cancellation_deadline": "2026-08-02T10:00:00Z" }] }

// POST /{key}/bookings/{booking_id}/cancel -> 200
-> { "status": "cancelled", "refund": { "amount": 60.0, "status": "pending" } }
```
`can_cancel` should be computed server-side from the cancellation policy: the widget
must not be the arbiter of refund eligibility. Refund handling on cancel still needs a
decision (auto-refund vs credit vs manual).

---

### 3.7 Booking at scale: many tutors per subject  🔨 UI BUILT, AWAITING BACKEND

**Problem.** The booking calendar fetches at most 300 upcoming lessons (6 pages of 50)
up front. A busy subject hits that within weeks and later dates silently look empty.
Services are one per tutor ("GCSE Maths with Amara"), so a subject with 30 tutors
fills the lesson-type list with 30 near-identical entries, and a day can hold dozens
of lessons.

**UI: built** (exercised by a synthetic "GCSE Maths" subject with 8 tutors in `api/mock.ts`)
- [x] Search picks a **subject** and covers every tutor who teaches it. There is
  deliberately no tutor picker: parents don't know the tutors at this point, and
  the tutor's name appears on each lesson instead
- [x] The calendar loads **one month at a time** as the parent pages through it
  (`useAppointmentsMonth`), so later dates are never cut off. Paging to a month
  selects its first bookable day; an empty month says so. Full lessons are hidden
- [x] Busy days (more than 6 lessons) list start times grouped into Morning / Afternoon /
  Evening; picking a time shows the tutors free then. Quiet days keep the plain list
- [x] Calendar dots show how busy a day is (1 to 3) rather than service colours
- [x] Slot rows are titled with the tutor when a search spans several tutors

**API needed**
```
GET /{key}/services
  results[].subject:    { id, name }          // shared across tutors' services
  results[].contractor: { id, name } | null   // the tutor, when there is one

GET /{key}/appointments
  ?services=1,2,3                // several services at once (today: one `service`)
  ?start_after=2026-10-01&start_before=2026-11-01
                                 // date range, so the calendar can load a month at
                                 // a time instead of the first 300 lessons
```
The mock derives `subject` and `contractor` by splitting service names on " with ",
which is only a naming convention. The real fields are needed before this ships.
The widget already sends `start_after`/`start_before`. Today's API ignores them and
returns everything from today, so the widget fetches up to 20 pages and filters to
the month itself: correct, but wasteful for big tenants. Adding the two filters to
`appointment_list` in socket-server (it only filters on `service` and `start > today`
now) makes each month one small request. At 100+ tutors even a month is too much,
and the calendar should switch to per-day counts plus a per-day lesson fetch.

## 4. Backlog (buildable now, no backend)

- [ ] Expose `sort_on` as a user-facing sort control (already in config, never surfaced)
- [ ] Filter by qualification level: `skills[].qual_levels` is already in the payload
- [ ] Shortlist / compare 2–3 tutors side by side (localStorage)
- [ ] "Add to calendar" (.ics) after booking: trivial from `start`/`finish`; cuts no-shows
- [ ] Waitlist capture when a lesson is full (we render "No spaces available" as a dead end)
- [ ] Multi-step / conditional enquiry form; save draft to localStorage
- [ ] Better no-results state: suggest broadening subject/location

## 5. Backlog (needs API/backend)

- [ ] Services & packages with prices
- [ ] Map view (needs lat/lng: the payload only gives a `distance` scalar)
- [ ] Deposit / payment at booking via TC's Stripe integration
- [ ] Recurring lesson booking
- [ ] Real-time remaining spaces

---

## 6. Suggested next steps

**Do now (small, self-contained, currently broken):**
1. **2.2 `distance_units`**: a live bug for imperial tenants. Hours.
2. **2.3 GA4 analytics**: Socket reports *nothing* today. Half a day.
3. **2.1 reCAPTCHA + honeypot**: close the spam hole before wider rollout.

**Do next (unblocks the big wins): in parallel, since it needs other people:**
4. Take **3.1 (reviews)** and **3.2 (rates/availability)** to whoever owns the Socket
   backend. Both are blocked purely on payload fields. Agree the contract, then the UI
   is a few days each. **These two fields unlock the highest-value work on this list.**
   Cheapest ask first: `review_count` and `rate_from` are single scalars.

**Then (while the API contract is being agreed):**
5. **3.2's "slot → prefilled enquiry"**: captures leads before any booking backend
   exists, and `contractor` is already a supported enquiry field.
6. **Backlog quick wins** that need no backend and lift conversion: expose `sort_on`,
   qual-level filter, waitlist capture on full lessons, "add to calendar" (.ics).
7. **Tests (2.4)**: `buildConfig` options-merge is where the last live bug hid
   (`auth_url` silently dropped); it deserves a regression test.

---

### Confidence note
Claims about *missing* API fields (no rate, no review text, no availability, no lat/lng)
were verified directly against live `/options`, `/contractors` and `/contractors/{id}`
payloads. Claims that TC *has* this data to expose are inferred from how the platform
works: **sanity-check with the backend team before committing to a contract.**
