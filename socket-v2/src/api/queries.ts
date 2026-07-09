import { useQuery } from '@tanstack/react-query'
import { useApi, useConfig } from '@/config/context'
import { useEventCallback } from '@/lib/useEventCallback'
import type {
  AppointmentListResponse,
  Contractor,
  ContractorListResponse,
  EnquiryFormInfo,
  Subject,
} from './types'

/** GET /{key}/subjects — the list of subjects for the subject filter. */
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
}

/** GET /{key}/contractors — the filtered, paginated contractor list. */
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
        },
        { signal },
      )
      emit('updated_contractors', data)
      return data
    },
    placeholderData: (prev) => prev,
  })
}

/** GET /{key}/appointments — the paginated upcoming appointment list. */
export function useAppointments(page: number) {
  const api = useApi()
  const config = useConfig()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['appointments', page, config.pagination],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<AppointmentListResponse>(
        'appointments',
        { page, pagination: config.pagination },
        { signal },
      )
      emit('updated_appointments', data)
      return data
    },
    placeholderData: (prev) => prev,
  })
}

/** GET /{key}/contractors/{id} — a single contractor's full profile (null on 404). */
export function useContractor(id: number) {
  const api = useApi()
  const emit = useEventCallback()
  return useQuery({
    queryKey: ['contractor', id],
    queryFn: async ({ signal }) => {
      const { status, data } = await api.get<Contractor>(`contractors/${id}`, undefined, {
        expectedStatuses: [200, 404],
        signal,
      })
      if (status === 404) return null
      emit('get_contractor_details', data)
      return data
    },
  })
}

/** GET /{key}/enquiry — the dynamic enquiry form schema. */
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
