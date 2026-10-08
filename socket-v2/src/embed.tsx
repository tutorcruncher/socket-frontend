import { StrictMode, useEffect, type MutableRefObject } from 'react'
import { render } from 'react-dom'
import { HashRouter, MemoryRouter, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './styles/socket.css'
import type { ResolvedConfig, SocketInstance, UserConfig } from './config/types'
import { buildConfig } from './config/buildConfig'
import { getCompanyOptions } from './api/options'
import { SocketProvider } from './config/context'
import { App } from './components/App'
import { ErrorView } from './components/shared/ErrorView'
import { installErrorReporter } from './lib/errorReporter'

installErrorReporter()

type NavRef = MutableRefObject<((path: string) => void) | null>

/** Captures react-router's navigate so the returned instance can expose goto(). */
function NavBridge({ navRef, urlBase }: { navRef: NavRef; urlBase: string }) {
  const navigate = useNavigate()
  useEffect(() => {
    navRef.current = (path: string) => navigate(urlBase + path)
    return () => {
      navRef.current = null
    }
  }, [navigate, navRef, urlBase])
  return null
}

function Root({
  config,
  error,
  navRef,
}: {
  config: ResolvedConfig
  error: string | null
  navRef: NavRef
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
  })
  // `memory` keeps routing entirely in-memory (no URL change); `hash` is refresh-safe
  // on any host. Both resolve links/navigation against a '/' base.
  const Router = config.router_mode === 'memory' ? MemoryRouter : HashRouter
  const urlBase = '/'

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <NavBridge navRef={navRef} urlBase={urlBase} />
          <SocketProvider config={config}>
            {error ? <ErrorView>{error}</ErrorView> : <App />}
          </SocketProvider>
        </Router>
      </QueryClientProvider>
    </StrictMode>
  )
}

/**
 * Public embed API: back-compatible with the original socket-frontend:
 *   window.socket(public_key, config) -> Promise<{ goto, config }>
 */
export async function socket(
  publicKey: string,
  userConfig?: UserConfig,
): Promise<SocketInstance | undefined> {
  const { config, error } = await buildConfig(publicKey, userConfig, getCompanyOptions)

  const el = document.querySelector(config.element)
  if (!el) {
    console.error(
      `SOCKET: page element "${config.element}" does not exist, unable to start socket view.`,
    )
    return
  }
  el.classList.add('tcs-root')
  // Themes are CSS variable overrides keyed on this attribute (see themes.css).
  el.setAttribute('data-tcs-theme', config.theme)

  const navRef: NavRef = { current: null }
  // preact/compat exposes the legacy render(vnode, container) API (not createRoot).
  render(<Root config={config} error={error} navRef={navRef} />, el)

  return {
    goto: (path: string) => navRef.current?.(path === 'enquiry-modal' ? 'enquiry' : path),
    config,
  }
}

declare global {
  interface Window {
    socket: typeof socket
  }
}

window.socket = socket
