import { useConfig } from '@/config/context'
import { cx } from '@/lib/utils'

/** Contractor photo, prefixing relative paths with the API root. */
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
  const photoSrc = src.startsWith('/') ? config.api_root + src : src
  return <img src={photoSrc} alt={alt} loading="lazy" className={cx('tw:object-cover', className)} />
}
