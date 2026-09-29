import type { Service } from '@/api/types'

/** The subject a service teaches; a service with no subject is its own subject. */
export const subjectOf = (s: Service): string => s.subject?.name ?? s.name

export interface SubjectGroup {
  name: string
  services: Service[]
}

/** Services grouped by subject, in the order each subject first appears. */
export function groupBySubject(services: Service[]): SubjectGroup[] {
  const groups = new Map<string, Service[]>()
  for (const s of services) {
    const key = subjectOf(s)
    const list = groups.get(key)
    if (list) list.push(s)
    else groups.set(key, [s])
  }
  return [...groups].map(([name, list]) => ({ name, services: list }))
}

/** Services a search covers: every tutor's service for a subject, or null for all. */
export function serviceIdsFor(services: Service[], subject: string | null): number[] | null {
  if (subject === null) return null
  const ids = services.filter((s) => subjectOf(s) === subject).map((s) => s.id)
  // Services not loaded yet: search everything rather than nothing.
  return ids.length ? ids : null
}
