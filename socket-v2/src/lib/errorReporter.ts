/**
 * Minimal, dependency-free error reporter (replaces @sentry/react to keep the embed
 * bundle small). Listens for uncaught errors that originate from the widget bundle
 * (`socket.js`) and logs them. If `VITE_SENTRY_DSN` is set it forwards a compact
 * payload to Sentry's HTTP store endpoint via `fetch`: no SDK required.
 */
let installed = false

export function installErrorReporter(): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  const dsn = import.meta.env.VITE_SENTRY_DSN
  const release = import.meta.env.VITE_RELEASE ?? 'dev'

  const fromSocket = (filename?: string) => !!filename && filename.includes('socket.js')

  const report = (message: string, filename?: string) => {
    if (!fromSocket(filename)) return
    console.error('[socket]', message)
    if (!dsn) return
    try {
      const m = dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(.+)$/)
      if (!m) return
      const [, key, host, projectId] = m
      const url = `https://${host}/api/${projectId}/store/?sentry_key=${key}&sentry_version=7`
      void fetch(url, {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          message,
          release,
          platform: 'javascript',
          tags: { host: window.location.host },
        }),
      }).catch(() => undefined)
    } catch {
      /* never let reporting throw */
    }
  }

  window.addEventListener('error', (e) => report(e.message, e.filename))
  window.addEventListener('unhandledrejection', (e) =>
    report(`Unhandled rejection: ${e.reason}`, 'socket.js'),
  )
}
