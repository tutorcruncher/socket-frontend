import { useCallback, useState } from 'react'
import { useConfig } from '@/config/context'
import type { DisplayMode } from '@/components/contractors/ContractorCards'

const storageKey = (publicKey: string) => `_tcs_display_mode_${publicKey}`

/** Read a previously chosen view, ignoring anything unparseable/unavailable
 *  (localStorage throws in Safari private mode and when cookies are blocked). */
function readStored(publicKey: string): DisplayMode | null {
  try {
    const stored = window.localStorage.getItem(storageKey(publicKey))
    return stored === 'grid' || stored === 'list' ? stored : null
  } catch {
    return null
  }
}

/**
 * The grid/list view for the tutor list. `config.display_mode` (set by the
 * embedder or the company's options) is the initial value; the visitor's own
 * choice wins after that and persists per widget across page loads.
 */
export function useDisplayMode(): [DisplayMode, (mode: DisplayMode) => void] {
  const config = useConfig()
  const [mode, setMode] = useState<DisplayMode>(
    () => readStored(config.public_key) ?? config.display_mode,
  )

  const choose = useCallback(
    (next: DisplayMode) => {
      setMode(next)
      try {
        window.localStorage.setItem(storageKey(config.public_key), next)
      } catch {
        // Storage unavailable: the choice still applies for this page view.
      }
    },
    [config.public_key],
  )

  return [mode, choose]
}
