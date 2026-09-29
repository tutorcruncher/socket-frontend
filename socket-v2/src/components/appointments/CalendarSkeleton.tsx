/**
 * Loading placeholder shaped like the real calendar step, so the layout doesn't
 * jump when results arrive. Mirrors CalendarStep: next-available banner, month
 * grid, and the day's slot list.
 */
export function CalendarSkeleton() {
  return (
    <div className="tw:flex tw:flex-col tw:gap-4" aria-busy="true" aria-live="polite">
      <span className="tw:sr-only">Loading lessons…</span>

      {/* next-available banner */}
      <div className="tw:h-12 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:animate-pulse" />

      <div className="tw:grid tw:md:grid-cols-2 tw:gap-4 tw:items-start">
        {/* month grid */}
        <div className="tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:p-4 tw:animate-pulse">
          <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
            <div className="tw:w-8 tw:h-8 tw:bg-hover tw:rounded-md" />
            <div className="tw:h-5 tw:w-32 tw:bg-hover tw:rounded" />
            <div className="tw:w-8 tw:h-8 tw:bg-hover tw:rounded-md" />
          </div>
          <div className="tw:grid tw:grid-cols-7 tw:gap-1 tw:mb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="tw:h-3 tw:bg-hover tw:rounded tw:mx-1" />
            ))}
          </div>
          <div className="tw:grid tw:grid-cols-7 tw:gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="tw:aspect-square tw:bg-hover tw:rounded-md" />
            ))}
          </div>
        </div>

        {/* slot list */}
        <div className="tw:flex tw:flex-col tw:gap-2">
          <div className="tw:h-4 tw:w-40 tw:bg-hover tw:rounded tw:animate-pulse tw:mb-1" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="tw:flex tw:items-center tw:gap-3 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:overflow-hidden tw:animate-pulse"
            >
              <div className="tw:w-1.5 tw:self-stretch tw:bg-hover tw:shrink-0" />
              <div className="tw:py-3 tw:w-16 tw:shrink-0 tw:flex tw:flex-col tw:gap-1.5 tw:items-center">
                <div className="tw:h-4 tw:w-12 tw:bg-hover tw:rounded" />
                <div className="tw:h-3 tw:w-10 tw:bg-hover tw:rounded" />
              </div>
              <div className="tw:flex-1 tw:py-3 tw:flex tw:flex-col tw:gap-1.5 tw:min-w-0">
                <div className="tw:h-4 tw:w-2/3 tw:bg-hover tw:rounded" />
                <div className="tw:h-3 tw:w-1/2 tw:bg-hover tw:rounded" />
              </div>
              <div className="tw:pr-3 tw:shrink-0">
                <div className="tw:h-7 tw:w-14 tw:bg-hover tw:rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
