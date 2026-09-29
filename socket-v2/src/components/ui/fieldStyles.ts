/**
 * Shared text-input styling for the booking/checkout forms.
 *
 * These were four near-identical copies across the checkout screens, which had
 * already drifted (differing padding and placeholder colours between steps).
 * Keeping them here means a field in one step can't silently stop matching the
 * next one: the flow reads as a single form.
 */
/**
 * Everything except width: callers add `tw:w-full` or `tw:flex-1` themselves,
 * so the two never collide on the same element.
 */
export const FIELD_BASE =
  'tw:px-3 tw:py-2.5 tw:text-sm tw:bg-white tw:border tw:rounded-lg tw:shadow-sm ' +
  'tw:transition-colors tw:placeholder:text-muted tw:hover:border-muted ' +
  'tw:focus:outline-2 tw:focus:outline-offset-0 tw:focus:outline-link'

/** Default (valid) border. Pair with FIELD_BASE. */
export const FIELD_BORDER = 'tw:border-default'

/** Error border, for a field failing validation. Pair with FIELD_BASE. */
export const FIELD_BORDER_ERROR = 'tw:border-error'

/** Field label: matched across every checkout step. */
export const FIELD_LABEL = 'tw:text-sm tw:font-medium tw:text-heading'
