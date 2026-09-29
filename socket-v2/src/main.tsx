/**
 * Dev entry: used by `npm run dev` only (NOT part of the shipped bundle).
 * Imports the embed module (which registers window.socket) and lazily mounts ONE
 * widget per tab. Mounting on demand avoids bursting the API with six instances at
 * once (the socket backend rate-limits), and mirrors how a host page embeds Socket.
 *
 * The surrounding page (index.html + demo/host.css) is a fictional tutoring agency
 * called "Bramble & Finch", so the widget can be demoed in a realistic host context.
 * The mode switcher is the one piece of demo-only furniture; a real embed just
 * calls window.socket() once.
 */
import './embed'
import type { UserConfig } from './config/types'

const env = import.meta.env
const publicKey = env.VITE_DEMO_PUBLIC_KEY ?? '9c79f14df986a1ec693c'
const apiRoot = env.VITE_DEMO_API_ROOT || undefined

// Per-tab widget config. `tutors` omits display_mode so the company's option picks
// the opening view: the visitor switches grid/list in the widget itself.
const TABS: Record<string, UserConfig> = {
  tutors: {
    mode: 'tutors',
    pagination: 8,
    event_callback: (n, v) => console.log('[event]', n, v),
  },
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
    // No router_mode override: each mode uses its safe default (hash, or memory
    // for plain enquiry), mirroring how a real embed behaves.
    window.socket(publicKey, {
      ...TABS[id],
      element: `#panel-${id}`,
      api_root: apiRoot,
    })
  }
}

document.querySelectorAll<HTMLButtonElement>('#tabs button').forEach((btn) => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab!))
})

showTab('tutors')
