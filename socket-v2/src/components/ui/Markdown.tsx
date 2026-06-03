import { toMarkdown } from '@/lib/utils'
import { cx } from '@/lib/utils'

/** Renders sanitized markdown (contractor bios, enquiry intros, extra attributes). */
export function Markdown({ content, className }: { content?: string | null; className?: string }) {
  return (
    <div
      className={cx('tcs-md tw:text-sm tw:text-primary', className)}
      dangerouslySetInnerHTML={{ __html: toMarkdown(content) }}
    />
  )
}
