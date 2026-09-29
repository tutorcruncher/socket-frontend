import type { ResolvedConfig } from '@/config/types'
import { mockPost } from './mock'

export interface RequestOptions {
  args?: Record<string, unknown>
  sendData?: unknown
  expectedStatuses?: number[]
  signal?: AbortSignal
}

export interface ApiError {
  msg: string
  url: string
  status: number
}

export interface ApiResult<T> {
  status: number
  data: T
}

function buildUrl(config: ResolvedConfig, path: string, args?: Record<string, unknown>): string {
  let url: string
  if (path.startsWith('/')) {
    url = config.api_root + path
  } else if (path.startsWith('http')) {
    url = path
  } else {
    url = `${config.api_root}/${config.public_key}/${path}`
  }

  if (args) {
    const params = new URLSearchParams()
    for (const [name, value] of Object.entries(args)) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(name, String(v)))
      } else if (value !== null && value !== undefined) {
        params.append(name, String(value))
      }
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }
  return url
}

/**
 * The single HTTP entry point for the widget. Uses `fetch` (the legacy app used
 * raw XHR) so callers get AbortSignal support and a clean promise interface.
 * Throws an {@link ApiError} on unexpected status / network failure.
 */
export async function request<T>(
  config: ResolvedConfig,
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<ApiResult<T>> {
  const expected = opts.expectedStatuses ?? [200]
  const url = buildUrl(config, path, opts.args)

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(opts.sendData !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opts.sendData !== undefined ? JSON.stringify(opts.sendData) : undefined,
      signal: opts.signal,
    })
  } catch (e) {
    // An aborted request (e.g. React Query cancelling on unmount / StrictMode
    // double-invoke) is not an error: rethrow quietly so it doesn't spam logs.
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    const err: ApiError = { msg: `Network error requesting ${url}: ${e}`, url, status: 0 }
    console.error('request error', err)
    throw err
  }

  if (!expected.includes(res.status)) {
    const body = await res.text().catch(() => '')
    const err: ApiError = {
      msg: `wrong response code ${res.status}, Response: ${body.substring(0, 500)}`,
      url,
      status: res.status,
    }
    console.error('request error', err)
    throw err
  }

  const data = (await res.json()) as T
  return { status: res.status, data }
}

/** Convenience helpers bound to a resolved config. */
export function createApi(config: ResolvedConfig) {
  return {
    get: <T>(path: string, args?: Record<string, unknown>, opts: RequestOptions = {}) =>
      request<T>(config, 'GET', path, { ...opts, args }),
    post: <T>(path: string, sendData?: unknown, opts: RequestOptions = {}) => {
      // Endpoints the backend hasn't built yet are served by the mock layer.
      const mocked = mockPost<T>(path, sendData)
      if (mocked) return mocked
      return request<T>(config, 'POST', path, {
        ...opts,
        sendData,
        expectedStatuses: opts.expectedStatuses ?? [201],
      })
    },
  }
}

export type Api = ReturnType<typeof createApi>
