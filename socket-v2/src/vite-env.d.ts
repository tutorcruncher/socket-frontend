/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET_API_URL?: string
  readonly VITE_GRECAPTCHA_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_RELEASE?: string
  /** Public key + api root used only by the dev demo page. */
  readonly VITE_DEMO_PUBLIC_KEY?: string
  readonly VITE_DEMO_API_ROOT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
