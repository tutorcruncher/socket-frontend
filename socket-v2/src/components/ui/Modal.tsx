import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useConfig } from '@/config/context'
import { cx } from '@/lib/utils'
import { CrossIcon } from './Icons'

const FADE_MS = 200

/**
 * Modal dialog. Portals into a `.tcs-root` container (so our scoped styles still
 * apply outside the widget root), locks body scroll, and fades in/out. Closing
 * is delegated to `onClose` so routed modals can navigate back.
 */
export function Modal({
  title,
  onClose,
  children,
  size = 'default',
}: {
  title?: ReactNode
  onClose: () => void
  children: ReactNode
  size?: 'default' | 'lg'
}) {
  const config = useConfig()
  // Create the portal node purely (no side effects in the initializer — that breaks
  // under StrictMode's double-invoke). Attach/detach happens in the effect below.
  const [container] = useState(() => document.createElement('div'))
  const [show, setShow] = useState(false)
  const closing = useRef(false)

  useEffect(() => {
    const host = config.modal_container
      ? document.getElementById(config.modal_container) || document.body
      : document.body
    container.className = 'tcs-root tcs-modal-portal'
    host.appendChild(container)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => setShow(true))
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = prevOverflow
      container.remove()
    }
  }, [container, config.modal_container])

  const handleClose = () => {
    if (closing.current) return
    closing.current = true
    setShow(false)
    setTimeout(onClose, FADE_MS)
  }

  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null)

    // Move focus into the dialog on open.
    requestAnimationFrame(() => (focusables()[0] ?? dialogRef.current)?.focus())

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key !== 'Tab') return
      // Trap Tab focus within the dialog.
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement as HTMLElement | null
      if (e.shiftKey && activeEl === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      className={cx(
        'tw:fixed tw:inset-0 tw:flex tw:items-start tw:justify-center tw:overflow-y-auto',
        'tw:bg-overlay tw:transition-opacity tw:duration-200 tw:ease-in-out',
        show ? 'tw:opacity-100' : 'tw:opacity-0',
      )}
      style={{ zIndex: 2147483000 }}
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="tw:relative tw:w-full tw:my-7 tw:mx-auto tw:p-4" style={{ maxWidth: size === 'lg' ? 900 : 650 }}>
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={cx(
            'tw:bg-white tw:rounded-xl tw:border tw:border-default tw:shadow-lg tw:overflow-hidden tw:outline-none',
            'tw:flex tw:flex-col tw:max-h-[85vh] tw:transition-transform tw:duration-200',
            show ? 'tw:translate-y-0' : 'tw:-translate-y-2',
          )}
        >
          <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-default tw:shrink-0">
            <h2 className="tw:font-medium tw:font-heading tw:text-xl tw:m-0">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded-md tw:text-muted-dark tw:hover:bg-hover tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
            >
              <CrossIcon className="tw:w-4 tw:h-4" />
            </button>
          </div>
          <div className="tw:p-6 tw:text-sm tw:text-primary tw:overflow-y-auto tw:min-h-0">
            {children}
          </div>
          <ModalFooter />
        </div>
      </div>
    </div>,
    container,
  )
}

function ModalFooter() {
  return (
    <div className="tw:flex tw:items-center tw:justify-end tw:gap-2 tw:px-6 tw:py-3 tw:border-t tw:border-default tw:bg-content tw:shrink-0">
      <a
        href="https://tutorcruncher.com"
        target="_blank"
        rel="noreferrer"
        className="tw:text-xs tw:text-muted-dark tw:hover:text-link"
      >
        Powered by TutorCruncher
      </a>
    </div>
  )
}
