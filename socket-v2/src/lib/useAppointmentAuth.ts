import { useCallback, useEffect, useState } from 'react'
import { useApi, useConfig } from '@/config/context'
import type { CheckClientResponse, SessionData, SsoArgs } from '@/api/types'
import {
  clearMockBookings,
  mockAttendees,
  MOCK_SSO_ARGS,
  seedMockClientBooking,
  USE_MOCK_API,
} from '@/api/mock'

const LS_KEY = '_tcs_user_data_'

export interface AppointmentAuth {
  /** Signed-in user + their students, or null when signed out. */
  session: SessionData | null
  /** Raw SSO args passed to check-client / book-appointment, or null. */
  ssoArgs: SsoArgs | null
  /** Map of appointment id -> attendee student ids the user is already on. */
  attendees: Record<number, number[]> | null
  signin: () => void
  signout: () => void
  refreshAttendees: () => Promise<void>
}

function readSession(): { ssoArgs: SsoArgs; session: SessionData } | null {
  const raw = window.sessionStorage[LS_KEY]
  if (!raw) return null
  try {
    const ssoArgs = JSON.parse(raw) as SsoArgs
    return { ssoArgs, session: JSON.parse(ssoArgs.sso_data) as SessionData }
  } catch {
    return null
  }
}

/**
 * Manages the appointment booking SSO session. Auth happens in a popup window
 * (config.auth_url) that posts a JSON SSO payload back via postMessage; we persist
 * it in sessionStorage and use it to look up which lessons the user already attends.
 */
export function useAppointmentAuth(): AppointmentAuth {
  const config = useConfig()
  const api = useApi()
  const [state, setState] = useState(() => readSession())
  const [attendees, setAttendees] = useState<Record<number, number[]> | null>(null)

  const ssoArgs = state?.ssoArgs ?? null

  const refreshAttendees = useCallback(async () => {
    if (!ssoArgs) return
    if (USE_MOCK_API) {
      // The demo client's lessons come from the mock booking store.
      await seedMockClientBooking()
      setAttendees(mockAttendees())
      return
    }
    try {
      const { data } = await api.get<CheckClientResponse>('check-client', ssoArgs)
      setAttendees(data.appointment_attendees)
    } catch (e) {
      // 401 -> session expired; sign the user out.
      if ((e as { status?: number }).status === 401) {
        window.sessionStorage.removeItem(LS_KEY)
        setState(null)
        setAttendees(null)
      }
    }
  }, [api, ssoArgs])

  useEffect(() => {
    void refreshAttendees()
  }, [refreshAttendees])

  const signin = useCallback(() => {
    if (USE_MOCK_API) {
      // Demo sign-in: no SSO popup, straight into the mock client's account.
      const raw = JSON.stringify(MOCK_SSO_ARGS)
      window.sessionStorage[LS_KEY] = raw
      setState({ ssoArgs: MOCK_SSO_ARGS, session: JSON.parse(MOCK_SSO_ARGS.sso_data) as SessionData })
      return
    }
    const onMessage = (event: MessageEvent) => {
      let parsed: SsoArgs
      try {
        parsed = JSON.parse(event.data)
      } catch {
        return
      }
      ;(event.source as Window | null)?.close?.()
      window.removeEventListener('message', onMessage)
      window.sessionStorage[LS_KEY] = event.data
      try {
        setState({ ssoArgs: parsed, session: JSON.parse(parsed.sso_data) as SessionData })
      } catch {
        /* ignore malformed payloads */
      }
    }
    window.addEventListener('message', onMessage, false)
    window.open(
      `${config.auth_url}?site=${encodeURIComponent(window.location.href)}`,
      'Auth',
      'width=1000,height=700,left=100,top=100,scrollbars,toolbar=0,resizable',
    )
  }, [config.auth_url])

  const signout = useCallback(() => {
    if (USE_MOCK_API) clearMockBookings()
    window.sessionStorage.removeItem(LS_KEY)
    setState(null)
    setAttendees(null)
  }, [])

  return {
    session: state?.session ?? null,
    ssoArgs,
    attendees,
    signin,
    signout,
    refreshAttendees,
  }
}
