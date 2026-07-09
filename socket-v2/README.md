# TutorCruncher Socket v2

A ground-up rebuild of the embeddable TutorCruncher Socket widget:
**Vite + React 18 + TypeScript + Tailwind v4**, following the TutorCruncher2
**UI2** design system. It preserves the original public embed API
(`window.socket(public_key, config)`) so existing customer integrations keep working.

## Why a rebuild

The original (`../`) is React 16 class components, CRA + react-app-rewired, raw XHR,
hand-rolled SCSS. This project modernises that with hooks, a typed API layer
(TanStack Query), a component-based design system, and a single self-contained
`socket.js` bundle built by Vite.

## Architecture

```
src/
  embed.tsx              # Library entry — defines window.socket(), mounts <Root>
  main.tsx               # Dev-only harness (tabbed demo); not in the bundle
  styles/socket.css      # Tailwind v4 + UI2 tokens, scoped under .tcs-root
  config/                # Config types, defaults/strings, buildConfig, React context
  api/                   # fetch client, response types, TanStack Query hooks, options
  lib/                   # formatting, utils (markdown/slug/contrast/groupBy)
  components/
    ui/                  # Design-system primitives (Button, Modal, Card, Badge,
                         #   Alert, Spinner, EmptyState, Markdown, Stars, Icons)
    shared/              # Photo, ErrorView
    contractors/         # Contractors list/grid, filters, pagination, detail modal
    enquiry/             # Dynamic schema-driven form + plain/modal entry points
    appointments/        # (stub — next to build)
    App.tsx              # Mode router
```

### Key design decisions

- **Embeddable, style-isolated.** Tailwind utilities use the `tw:` prefix and the
  reset is scoped to `.tcs-root`, so the widget never leaks styles into — or inherits
  a broken reset from — the host page. Modals portal into a `.tcs-root` container.
- **Back-compatible API.** `window.socket(public_key, config)` returns
  `{ goto, config }` exactly like the legacy widget; all config keys and the
  `messages`/`event_callback` hooks are preserved.
- **Single bundle.** `vite build` emits one `dist/socket.js` (IIFE) with CSS injected
  by JS, so embeds include one `<script>`.
- **Small bundle (~71 kB gzip).** React is aliased to `preact/compat` and
  `react-select` was replaced by a custom `Combobox`, cutting the bundle from
  ~243 kB → ~71 kB gzip. `@sentry/react` was swapped for a tiny dependency-free
  error reporter (`lib/errorReporter.ts`).
- **Typed data layer.** TanStack Query gives caching, dedup, request cancellation and
  loading/error states the legacy app lacked.

## Routing on a host page

The widget runs on a customer's own server (which has no SPA catch-all), so there are
two safe `router_mode`s — and **no `history` mode** (it would 404 on a host refresh):

- **`hash`** (default for grid/list/appointments/enquiry-modal): deep-links to
  `abc.com/#/2418960-amala-h`. The `#` is never sent to the server, so direct visits
  and refreshes always load `abc.com/` and the widget re-opens the view client-side.
  No host config required, and links are shareable.
- **`memory`** (default for the plain `enquiry` form, which never navigates): keeps all
  routing in memory and **never touches the host URL** — no `#/` is appended. Trade-off:
  no deep-linking and the back button won't close a modal. Opt into it for any mode if
  you want zero URL impact.

Legacy embeds that still pass `router_mode: 'history'` are coerced to `hash` with a
console warning, so they keep working (and stop 404-ing on refresh).

## Setup

```sh
npm install
cp .env.example .env   # adjust if needed
npm run dev            # tabbed demo at http://localhost:5173
npm run build          # -> dist/socket.js
npm run typecheck
```

### Local testing against the live API

The socket backend enforces an `Origin` allow-list, so a browser at `localhost` is
rejected (403). `vite.config.ts` includes a dev proxy that forwards `/socket-api/*`
to `https://socket.tutorcruncher.com` and strips the `Origin`/`Referer` headers. The
demo points `api_root` at `/socket-api` (`VITE_DEMO_API_ROOT`) so it talks to the
proxy. Demo key: `9c79f14df986a1ec693c` (Dino Tutors).

## Status

| Section | State |
|---|---|
| Core embed + config + design system | ✅ Done |
| Contractors (grid/list, subject + location filters, pagination, profile modal, stars) | ✅ Done, verified against live API |
| Enquiry (dynamic form, plain page, modal button, contractor-prefilled) | ✅ Done (reCAPTCHA wiring is a TODO) |
| Appointments (month/day list, SSO popup auth, booking modal) | ✅ Done, list + booking UI verified against live API |
| Bundle optimisation (preact, custom combobox, no Sentry) | ✅ Done — 243 → 71 kB gzip |
| UX polish (skeletons, photo fallbacks, modal focus-trap, reduced-motion) | ✅ Done |

### Known follow-ups

- **reCAPTCHA**: enquiry submit posts without a captcha token yet; wire grecaptcha v2/v3.
- **Appointments booking end-to-end**: the list + booking UI are built and verified;
  the SSO popup + book POST need a company with `auth_url` configured to test fully.
- **Tests**: add unit tests (Vitest) for `buildConfig`, formatting, and route parsing.
- **Further bundle trimming**: per-mode code-split is intentionally skipped to keep the
  single-file embed; TanStack Query/marked/dompurify are the remaining large deps.
