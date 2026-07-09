/** Loading placeholders that mirror the grid/list card layouts. */
export function ContractorSkeleton({ mode, count = 6 }: { mode: 'grid' | 'list'; count?: number }) {
  const items = Array.from({ length: count })
  if (mode === 'grid') {
    return (
      <div className="tw:grid tw:grid-cols-2 tw:sm:grid-cols-3 tw:md:grid-cols-4 tw:gap-4">
        {items.map((_, i) => (
          <div
            key={i}
            className="tw:bg-white tw:border tw:border-default tw:rounded-lg tw:overflow-hidden tw:animate-pulse"
          >
            <div className="tw:aspect-square tw:bg-hover" />
            <div className="tw:h-4 tw:bg-hover tw:rounded tw:m-3" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      {items.map((_, i) => (
        <div
          key={i}
          className="tw:flex tw:gap-4 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:p-4 tw:animate-pulse"
        >
          <div className="tw:w-24 tw:h-24 tw:sm:w-32 tw:sm:h-32 tw:bg-hover tw:rounded-lg tw:shrink-0" />
          <div className="tw:flex-1 tw:space-y-2 tw:py-1">
            <div className="tw:h-4 tw:bg-hover tw:rounded tw:w-1/3" />
            <div className="tw:h-3 tw:bg-hover tw:rounded tw:w-1/2" />
            <div className="tw:h-3 tw:bg-hover tw:rounded tw:w-full" />
            <div className="tw:h-3 tw:bg-hover tw:rounded tw:w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
