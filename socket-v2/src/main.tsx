/**
 * Dev entry — used by `npm run dev` only (NOT part of the shipped bundle).
 * Imports the embed module (which registers window.socket) and lazily mounts ONE
 * widget per tab. Mounting on demand avoids bursting the API with six instances at
 * once (the socket backend rate-limits), and mirrors how a host page embeds Socket.
 */
import './embed'
import type { UserConfig } from './config/types'

const env = import.meta.env
const publicKey = env.VITE_DEMO_PUBLIC_KEY ?? '9c79f14df986a1ec693c'
const apiRoot = env.VITE_DEMO_API_ROOT || undefined

// Per-tab widget config. `options` omits mode so the company's display_mode wins.
const TABS: Record<string, UserConfig> = {
  options: { pagination: 8 },
  grid: { mode: 'grid', pagination: 8, event_callback: (n, v) => console.log('[event]', n, v) },
  list: { mode: 'list', pagination: 5 },
  enquiry: { mode: 'enquiry', terms_link: 'https://www.example.com' },
  'enquiry-modal': { mode: 'enquiry-modal' },
  appointments: { mode: 'appointments' },
}

const initialised = new Set<string>()

function showTab(id: string) {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('#tabs button')) {
    btn.setAttribute('aria-selected', String(btn.dataset.tab === id))
  }
  for (const panel of document.querySelectorAll<HTMLDivElement>('.panel')) {
    panel.hidden = panel.id !== `panel-${id}`
  }
  if (!initialised.has(id)) {
    initialised.add(id)
    window.socket(publicKey, {
      ...TABS[id],
      element: `#panel-${id}`,
      router_mode: 'history',
      api_root: apiRoot,
    })
  }
}

document.querySelectorAll<HTMLButtonElement>('#tabs button').forEach((btn) => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab!))
})

showTab('options')
