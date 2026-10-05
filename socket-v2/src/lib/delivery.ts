import type { DeliveryMode } from '@/api/types'
import type { ResolvedConfig } from '@/config/types'

export const DELIVERY_MODES: DeliveryMode[] = ['online', 'in_person']

/** Message key for a delivery mode's label / help text. */
export const deliveryLabelKey = (m: DeliveryMode) => `delivery_${m}` as const
export const deliveryHelpKey = (m: DeliveryMode) => `delivery_${m}_help` as const

/**
 * Format a distance in metres using the company's `distance_units` option.
 * The live API serves `distance_units: "miles"` for some tenants; before this the
 * widget hardcoded km (ROADMAP §2.2).
 */
export function formatDistance(config: ResolvedConfig, metres: number): string {
  if (config.distance_units === 'miles') {
    const miles = Math.round((metres / METRES_PER_MILE) * 10) / 10
    return config.get_text('distance_away_miles', { distance: miles })
  }
  const km = Math.round((metres / 1000) * 10) / 10
  return config.get_text('distance_away', { distance: km })
}

/** Bare distance (no "away" suffix), for compact contexts like "Travels up to 10km". */
export function formatDistanceShort(config: ResolvedConfig, metres: number): string {
  if (config.distance_units === 'miles') {
    return `${Math.round((metres / METRES_PER_MILE) * 10) / 10} miles`
  }
  return `${Math.round((metres / 1000) * 10) / 10}km`
}

const METRES_PER_MILE = 1609.34

/**
 * Radius options offered in the search form, in metres, chosen to be round numbers
 * in the tenant's units: 25 km is "15.5 miles" to a tenant that works in miles.
 */
export function radiusOptions(config: ResolvedConfig): number[] {
  return config.distance_units === 'miles'
    ? [2, 5, 10, 25].map((miles) => Math.round(miles * METRES_PER_MILE))
    : [5000, 10000, 25000, 50000]
}

/** The radius a search starts with: 10 miles, or 25 km. */
export function defaultRadius(config: ResolvedConfig): number {
  return config.distance_units === 'miles' ? Math.round(10 * METRES_PER_MILE) : 25000
}
