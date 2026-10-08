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

/**
 * Tints for the initials fallback. Picked by name hash so a given tutor always
 * gets the same colour: a placeholder that changes between renders reads as a
 * glitch. Deliberately low-saturation so a wall of fallbacks stays calm.
 */
const TINTS = [
  'tw:bg-[#dbeafe] tw:text-[#1e40af]',
  'tw:bg-[#e0e7ff] tw:text-[#3730a3]',
  'tw:bg-[#ede9fe] tw:text-[#5b21b6]',
  'tw:bg-[#fce7f3] tw:text-[#9d174d]',
  'tw:bg-[#d1fae5] tw:text-[#065f46]',
  'tw:bg-[#fef3c7] tw:text-[#92400e]',
]

function tintFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return TINTS[h % TINTS.length]
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
          'tw:flex tw:items-center tw:justify-center tw:font-medium tw:font-heading tw:select-none',
          tintFor(alt),
          className,
        )}
        aria-label={alt}
        role="img"
      >
        {initials(alt) || '?'}
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
