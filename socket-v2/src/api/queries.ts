import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useApi, useConfig } from '@/config/context'
import { useEventCallback } from '@/lib/useEventCallback'
import {
  applyMockContractorFilters,
  applyMockFilters,
  enrichContractor,
  enrichServices,
  isMockBusyService,
  loadMockTutors,
  mockBusyAppointments,
  mockPackages,
  mockReviews,
  mockTutorProfile,
  USE_MOCK_API,
} from './mock'
import { addMonths, dayKey, monthKey } from '@/lib/calendar'
import type {
  Appointment,
  AppointmentListResponse,
  Contractor,
  ContractorListResponse,
  DeliveryMode,
  EnquiryFormInfo,
  PackageListResponse,
  QualLevel,
  SearchedLocation,
  ServiceListResponse,
  Subject,
} from './types'

/** GET /{key}/subjects: the list of subjects for the subject filter. */
export function useSubjects(enabled = true) {
  const api = useApi()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['subjects'],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<Subject[]>('subjects')
      emit('get_subjects', data)
      return data
    },
  })
}

export interface ContractorQueryArgs {
  subject: number | null
  page: number
  location: string | null
  /** V2 (ROADMAP §3.2): online-only toggle. */
  remote?: boolean | null
  /** V2 (ROADMAP §3.2): inclusive hourly-rate bounds. */
  rateMin?: number | null
  rateMax?: number | null
}

/** GET /{key}/contractors: the filtered, paginated contractor list. */
export function useContractors(args: ContractorQueryArgs) {
  const api = useApi()
  const config = useConfig()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['contractors', args, config.sort_on, config.pagination, config.contractor_filter],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ContractorListResponse>(
        'contractors',
        {
          ...config.contractor_filter,
          subject: args.subject,
          pagination: config.pagination,
          sort: config.sort_on,
          page: args.page,
          location: args.location,
          // The live API ignores these; the mock applies them client-side until
          // the backend ships §3.2. Sending them for real once it does costs nothing.
          ...(USE_MOCK_API
            ? {}
            : { remote: args.remote, rate_min: args.rateMin, rate_max: args.rateMax }),
        },
        { signal },
      )
      emit('updated_contractors', data)
      if (!USE_MOCK_API) return data
      return applyMockContractorFilters(data, {
        remote: args.remote,
        rate_min: args.rateMin,
        rate_max: args.rateMax,
      })
    },
    placeholderData: (prev) => prev,
  })
}

/** The tenant's tutors, for the mock to attach to services (see `loadMockTutors`). */
function useMockTutors() {
  const api = useApi()
  return () =>
    loadMockTutors(async () => {
      const { data } = await api.get<ContractorListResponse>('contractors', { pagination: 50 })
      return data.results
    })
}

/** GET /{key}/services: the bookable lesson types. */
export function useServices() {
  const api = useApi()
  const mockTutors = useMockTutors()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['services'],
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ServiceListResponse>('services', undefined, { signal })
      emit('get_services', data)
      return USE_MOCK_API ? enrichServices(data.results, await mockTutors()) : data.results
    },
  })
}

// The API caps pagination at 50/page; a calendar needs a wide window, so fetch the
// first page for the count, then the remaining pages in parallel up to a cap.
const PAGE_SIZE = 50
const MAX_PAGES = 6 // 300 upcoming lessons is plenty for a booking calendar

export interface AppointmentsWindow {
  appointments: Appointment[]
  /** Total upcoming on the server; > appointments.length when the cap was hit. */
  total: number
  truncated: boolean
  /** Geocoding echo when a location was searched. */
  location: SearchedLocation | null
}

export interface AppointmentFilters {
  /** Services to include (every tutor's version of a subject); null for all. */
  serviceIds: number[] | null
  delivery: DeliveryMode | null
  location: string | null
  /** Search radius in metres. */
  radius: number | null
}

/**
 * Wide window of upcoming appointments for the booking calendar.
 *
 * `service` filtering is server-side today. `delivery`/`location`/`radius` are the
 * **V2 contract**: the real API will filter server-side; until then the mock layer
 * applies them client-side (see `api/mock.ts`).
 */
export function useAppointmentsWindow(filters: AppointmentFilters) {
  const api = useApi()
  const mockTutors = useMockTutors()
  const emit = useEventCallback()
  const { serviceIds, delivery, location, radius } = filters
  return useQuery({
    queryKey: ['appointments-window', serviceIds?.join(',') ?? null, delivery, location, radius],
    staleTime: 60_000,
    queryFn: async ({ signal }): Promise<AppointmentsWindow> => {
      // Today's API filters by a single `service`. Several services (a subject
      // taught by many tutors) is the V2 `services` param; the mock fetches
      // everything and filters client-side instead.
      const single = serviceIds?.length === 1 ? serviceIds[0] : undefined
      const args = (page: number) => ({
        page,
        pagination: PAGE_SIZE,
        service: single,
        // Sent for the real backend; harmlessly ignored by today's API.
        ...(USE_MOCK_API
          ? {}
          : {
              services: serviceIds && !single ? serviceIds.join(',') : undefined,
              delivery,
              location,
              radius,
            }),
      })
      // The mock's busy subject has no real lessons to fetch.
      const skipFetch =
        USE_MOCK_API && !!serviceIds && serviceIds.length > 0 && serviceIds.every(isMockBusyService)
      let appointments: Appointment[] = []
      let total = 0
      let searched: SearchedLocation | null = null
      if (!skipFetch) {
        const first = await api.get<AppointmentListResponse>('appointments', args(1), { signal })
        total = first.data.count
        const pages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_PAGES)
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            api.get<AppointmentListResponse>('appointments', args(i + 2), { signal }),
          ),
        )
        appointments = [first, ...rest].flatMap((r) => r.data.results)
        searched = first.data.location ?? null
      }

      if (USE_MOCK_API) {
        const wanted = serviceIds ? new Set(serviceIds) : null
        const merged = [...appointments, ...mockBusyAppointments(await mockTutors())]
          .filter((a) => !wanted || wanted.has(a.service_id))
          .sort((a, b) => a.start.localeCompare(b.start))
        const mocked = applyMockFilters({ count: merged.length, results: merged }, { delivery, location, radius })
        // Apply the same cap the real API's pagination imposes, so the UI's
        // handling of a truncated window can be exercised.
        total = mocked.results.length
        appointments = mocked.results.slice(0, PAGE_SIZE * MAX_PAGES)
        searched = mocked.location ?? null
      }

      emit('updated_appointments', { count: appointments.length, results: appointments })
      return {
        appointments,
        total,
        truncated: total > appointments.length,
        location: searched,
      }
    },
    // No placeholderData: carrying the previous filter's results over made lessons
    // visibly appear then swap when a new search resolved. A skeleton is honest.
  })
}

// A month of a busy subject can run to hundreds of lessons; this is a safety cap,
// not a window size. Past it, a per-day endpoint is needed (ROADMAP §3.7).
const MONTH_MAX_PAGES = 20

/**
 * One calendar month of appointments ("YYYY-MM"), fetched as the visitor pages
 * through the calendar, so later dates are never cut off by a fixed window.
 *
 * `start_after`/`start_before` are the V2 date-range params; today's API ignores
 * them and returns everything from today, so results are also filtered to the
 * month here. That keeps the calendar correct now and cheap once the API filters.
 */
export function useAppointmentsMonth(filters: AppointmentFilters, month: string | null) {
  const api = useApi()
  const mockTutors = useMockTutors()
  const { serviceIds, delivery, location, radius } = filters
  return useQuery({
    queryKey: ['appointments-month', month, serviceIds?.join(',') ?? null, delivery, location, radius],
    enabled: month !== null,
    staleTime: 60_000,
    // Keep the previous month on screen while the next loads, rather than a skeleton.
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }): Promise<Appointment[]> => {
      const from = `${month}-01`
      const to = `${addMonths(month!, 1)}-01`
      const single = serviceIds?.length === 1 ? serviceIds[0] : undefined
      const args = (page: number) => ({
        page,
        pagination: PAGE_SIZE,
        service: single,
        start_after: from,
        start_before: to,
        ...(USE_MOCK_API
          ? {}
          : {
              services: serviceIds && !single ? serviceIds.join(',') : undefined,
              delivery,
              location,
              radius,
            }),
      })
      const skipFetch =
        USE_MOCK_API && !!serviceIds && serviceIds.length > 0 && serviceIds.every(isMockBusyService)
      let appointments: Appointment[] = []
      if (!skipFetch) {
        const first = await api.get<AppointmentListResponse>('appointments', args(1), { signal })
        const pages = Math.min(Math.ceil(first.data.count / PAGE_SIZE), MONTH_MAX_PAGES)
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            api.get<AppointmentListResponse>('appointments', args(i + 2), { signal }),
          ),
        )
        appointments = [first, ...rest].flatMap((r) => r.data.results)
      }
      if (USE_MOCK_API) {
        const wanted = serviceIds ? new Set(serviceIds) : null
        const merged = [...appointments, ...mockBusyAppointments(await mockTutors())]
          .filter((a) => !wanted || wanted.has(a.service_id))
          .sort((a, b) => a.start.localeCompare(b.start))
        appointments = applyMockFilters(
          { count: merged.length, results: merged },
          { delivery, location, radius },
        ).results
      }
      return appointments.filter((a) => monthKey(dayKey(a.start)) === month)
    },
  })
}

/** GET /{key}/contractors/{id}: a single contractor's full profile (null on 404). */
export function useContractor(id: number) {
  const api = useApi()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['contractor', id],
    queryFn: async ({ signal }) => {
      // The mock's generated tutors have no record on the real API.
      const generated = USE_MOCK_API ? mockTutorProfile(id) : null
      if (generated) return generated
      const { status, data } = await api.get<Contractor>(`contractors/${id}`, undefined, {
        expectedStatuses: [200, 404],
        signal,
      })
      if (status === 404) return null
      emit('get_contractor_details', data)
      if (!USE_MOCK_API) return data
      return { ...enrichContractor(data), reviews: mockReviews(data.id, data.review_rating) }
    },
  })
}

/** GET /{key}/enquiry: the dynamic enquiry form schema. */
export function useEnquiryForm(enabled = true) {
  const api = useApi()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['enquiry-form'],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await api.get<EnquiryFormInfo>('enquiry')
      emit('get_enquiry_data', data)
      return data
    },
  })
}

/** GET /{key}/packages: the credit packages the tenant sells. Mocked until served. */
export function usePackages() {
  const api = useApi()
  return useQuery({
    queryKey: ['packages'],
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      if (USE_MOCK_API) return mockPackages()
      const { data } = await api.get<PackageListResponse>('packages', undefined, { signal })
      return data.results
    },
  })
}

/** GET /{key}/qual-levels: the levels tutors teach at, for the lesson request. */
export function useQualLevels() {
  const api = useApi()
  return useQuery({
    queryKey: ['qual-levels'],
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<QualLevel[]>('qual-levels', undefined, { signal })
      return data
    },
  })
}
