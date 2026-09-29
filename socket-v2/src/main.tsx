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
import type { SocketTheme, UserConfig } from './config/types'

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
let currentTab = 'tutors'
// Remembered across reloads so a theme can be reviewed page by page.
let theme: SocketTheme = (localStorage.getItem('tcs-demo-theme') as SocketTheme) || 'classic'

function showTab(id: string) {
  currentTab = id
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
      theme,
    })
  }
}

/**
 * Switch theme: every mounted widget is torn down (a fresh panel element, so
 * preact's render tree goes with it) and the visible tab mounts again with the
 * new theme.
 */
function setTheme(next: SocketTheme) {
  theme = next
  localStorage.setItem('tcs-demo-theme', next)
  for (const btn of document.querySelectorAll<HTMLButtonElement>('#themes button')) {
    btn.setAttribute('aria-selected', String(btn.dataset.theme === next))
  }
  for (const id of initialised) {
    const panel = document.getElementById(`panel-${id}`)
    panel?.replaceWith(panel.cloneNode(false))
  }
  initialised.clear()
  showTab(currentTab)
}

document.querySelectorAll<HTMLButtonElement>('#themes button').forEach((btn) => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme as SocketTheme))
})

document.querySelectorAll<HTMLButtonElement>('#tabs button').forEach((btn) => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab!))
})

setTheme(theme)
