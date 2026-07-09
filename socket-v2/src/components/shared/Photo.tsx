import { useState } from 'react'
import { useConfig } from '@/config/context'
import { cx } from '@/lib/utils'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Contractor photo, prefixing relative paths with the API root. Falls back to an
 *  initials placeholder if the image is missing or fails to load. */
export function Photo({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const config = useConfig()
  const [failed, setFailed] = useState(false)
  const photoSrc = src && src.startsWith('/') ? config.api_root + src : src

  if (!photoSrc || failed) {
    return (
      <div
        className={cx(
          'tw:flex tw:items-center tw:justify-center tw:bg-content tw:text-muted-dark tw:font-medium tw:font-heading tw:select-none',
          className,
        )}
        aria-label={alt}
        role="img"
      >
        {initials(alt) || '—'}
      </div>
    )
  }

  return (
    <img
      src={photoSrc}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cx('tw:object-cover', className)}
    />
  )
}
