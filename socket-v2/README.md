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
- **Typed data layer.** TanStack Query gives caching, dedup, request cancellation and
  loading/error states the legacy app lacked.

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
| Appointments (browse + SSO booking) | 🚧 Stub — next |

### Known follow-ups

- **Bundle size** (~243 kB gzip): consider `preact/compat`, lazy-loading `react-select`,
  and dropping `@sentry/react` for a lighter capture.
- **reCAPTCHA**: enquiry submit posts without a captcha token yet; wire grecaptcha v2/v3.
- **Appointments**: port month/day grouping, SSO popup auth (`_tcs_user_data_`),
  and the booking modal against `/appointments`, `/check-client`, `/book-appointment`.
- **Tests**: add unit tests (Vitest) for `buildConfig`, formatting, and route parsing.
