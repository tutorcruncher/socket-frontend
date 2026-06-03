import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ResolvedConfig } from './types'
import { createApi, type Api } from '@/api/client'

interface SocketContextValue {
  config: ResolvedConfig
  api: Api
  /** Prefix a relative path with the configured url base (for routing/links). */
  url: (path?: string) => string
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({
  config,
  children,
}: {
  config: ResolvedConfig
  children: ReactNode
}) {
  const value = useMemo<SocketContextValue>(() => {
    const api = createApi(config)
    const urlBase = config.router_mode === 'history' ? config.url_root : '/'
    const url = (path?: string) => urlBase + (path || '')
    return { config, api, url }
  }, [config])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider')
  return ctx
}

export const useConfig = () => useSocket().config
export const useApi = () => useSocket().api
export const useUrl = () => useSocket().url
