import { useCallback } from 'react'
import { useConfig } from '@/config/context'

/** Returns the host-page analytics hook: config.event_callback(name, data). */
export function useEventCallback() {
  const config = useConfig()
  return useCallback(
    (name: string, data: unknown) => {
      try {
        config.event_callback(name, data)
      } catch (e) {
        console.error('event_callback threw', e)
      }
    },
    [config],
  )
}
