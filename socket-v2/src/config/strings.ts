import type { Messages } from './types'

/**
 * Default user-facing strings. Every string is overridable per-instance via the
 * `messages` config key, and many are customised per-tenant — do not remove keys.
 * Ported verbatim from the original socket-frontend STRINGS.
 */
export const STRINGS: Messages = {
  skills_label: 'Skills',
  contractor_enquiry:
    'Please enter your details below to enquire about tutoring with {contractor_name}.',
  enquiry: 'Please enter your details below and we will get in touch with you shortly.',
  contractor_enquiry_button: 'Contact {contractor_name}',
  contractor_details_button: 'Show Profile',
  submit_enquiry: 'Submit Enquiry',
  enquiry_submitted_thanks: 'Enquiry submitted, thank you.',
  enquiry_modal_submitted_thanks:
    'Enquiry submitted, thank you.\n\nYou can now close this window.',
  enquiry_button: 'Get in touch',
  enquiry_title: 'Enquiry',
  grecaptcha_missing: 'This captcha is required',
  required: ' (Required)',
  subject_filter_placeholder: 'Select a subject...',
  filter_summary_single: 'showing 1 result',
  filter_summary_plural: 'showing {count} results',
  location_input_placeholder: 'Enter your address or zip/postal code...',
  view_profile: 'View Profile',
  review_hours: '({hours} hours)',
  previous: 'Previous',
  next: 'Next',
  no_tutors_found: 'No tutors found.',
  no_tutors_found_loc: 'No more tutors found near "{location}".',
  no_tutors_found_no_loc: 'No more tutors, unable to locate "{location}".',
  no_tutors_found_rate_limited: 'Too many location lookups, no results.',
  distance_away: '{distance}km away',
  book_appointment_button: 'Book Lesson',
  add_to_lesson: 'Add to Lesson',
  diff_minutes: '{minutes} mins',
  diff_1hour: '1 hour',
  diff_1hour_minutes: '1 hour {minutes} mins',
  diff_hours: '{hours} hours',
  diff_hours_minutes: '{hours} hours {minutes} mins',
  spaces: ({ spaces }) => {
    if (spaces === null) return 'Spaces available'
    if (spaces === 0) return 'No spaces available'
    if (spaces === 1) return '1 space available'
    return `${spaces} spaces available`
  },
  spaces_attending: ({ spaces }) => {
    if (spaces === null) return "You're already attending, more spaces available"
    if (spaces === 0) return "You're already attending, no more spaces available"
    if (spaces === 1) return "You're already attending, 1 more space available"
    return `You're already attending, ${spaces} more spaces available`
  },
  add_existing_students: 'Add your existing Students to the lesson',
  add_new_student: 'Add a new Student to the lesson',
  appointment_not_found: 'Appointment not Found',
  appointment_not_found_id: 'No Appointment found with id {apt_id}.',
  price: 'Price',
  job: 'Job',
  start: 'Start',
  finish: 'Finish',
  location: 'Location',
  not_you_sign_out: 'Not you? sign out',
  added: 'Added',
  assuming_timezone: "Times are based off your browser's timezone of {timezone}",
  terms_title: 'Terms and Conditions',
  terms_help: 'I have read and agree to the',
  terms_link: 'terms and conditions',
  loading: 'Loading...',
  contractor_not_found: 'Contractor not Found',
  contractor_not_found_id: 'No Contractor found with id {contractor_id}.',
}

export const MODES = ['grid', 'list', 'enquiry', 'enquiry-modal', 'appointments'] as const
// `history` was removed in v2: it only works on hosts with an SPA catch-all (a
// drop-in widget can't assume that), so it 404s on refresh. `hash` is safe on any
// host; `memory` touches the URL not at all (no deep-linking).
export const ROUTER_MODES = ['hash', 'memory'] as const

export const DEFAULT_COMPANY_OPTIONS = {
  display_mode: 'grid' as const,
  pagination: 100,
  router_mode: 'hash' as const,
  show_hours_reviewed: true,
  show_labels: true,
  show_location_search: true,
  show_stars: true,
  show_subject_filter: true,
  sort_on: 'name',
}
