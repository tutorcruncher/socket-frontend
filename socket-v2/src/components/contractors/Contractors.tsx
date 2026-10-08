import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import { useContractors, useSubjects } from '@/api/queries'
import { slugify } from '@/lib/utils'
import type { Subject } from '@/api/types'
import { Grid, List, ViewToggle } from './ContractorCards'
import { useDisplayMode } from '@/lib/useDisplayMode'
import {
  SubjectSelect,
  LocationInput,
  RateAndRemoteFilters,
  FilterChip,
  type RateRange,
} from './Filters'
import { Pagination } from './Pagination'
import { ContractorModal } from './ContractorModal'
import { ContractorSkeleton } from './ContractorSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Alert } from '@/components/ui/Alert'

const parseSubjectId = (path: string): number | null => {
  const m = path.match(/subject\/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}
const parsePage = (path: string): number => {
  const m = path.match(/page\/(\d+)/)
  return m ? parseInt(m[1], 10) : 1
}

export function Contractors() {
  const config = useConfig()
  const url = useUrl()
  const navigate = useNavigate()
  const loc = useLocation()

  const { data: subjects = [] } = useSubjects()
  const [locationStr, setLocationStr] = useState<string | null>(null)
  const [displayMode, setDisplayMode] = useDisplayMode()
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [rate, setRate] = useState<RateRange | null>(null)

  // Is a contractor modal open? (path begins with a numeric id, e.g. `/123-jane`)
  const stripped = loc.pathname.replace(url(''), '').replace(/^\//, '')
  const contractorMatch = stripped.match(/^(\d+)(?:-|$)/)
  const contractorId = contractorMatch ? parseInt(contractorMatch[1], 10) : null

  // Freeze the list query args while a modal is open so the list behind it
  // doesn't refetch (the contractor URL no longer encodes subject/page).
  const listArgsRef = useRef({ subjectId: parseSubjectId(loc.pathname), page: parsePage(loc.pathname) })
  const lastListUrlRef = useRef(url(''))
  if (contractorId === null) {
    listArgsRef.current = { subjectId: parseSubjectId(loc.pathname), page: parsePage(loc.pathname) }
    lastListUrlRef.current = loc.pathname + loc.search
  }
  const { subjectId, page } = listArgsRef.current
  const selectedSubject = subjects.find((s) => s.id === subjectId) ?? null

  const { data: response, isFetching, isError } = useContractors({
    subject: subjectId,
    page,
    location: locationStr,
    remote: remoteOnly || null,
    rateMin: rate?.min ?? null,
    rateMax: rate?.max ?? null,
  })

  const subjectUrl = (subject: Subject | null) =>
    subject ? url(`subject/${subject.id}-${slugify(subject.name)}`) : url('')
  const pageUrl = (subject: Subject | null, p: number) => {
    let u = subjectUrl(subject)
    if (p > 1) u += `${u.endsWith('/') ? '' : '/'}page/${p}`
    return u
  }

  const count = response?.count
  const locationPretty = response?.location?.pretty ?? null

  // Which V2 fields the backend actually serves (ROADMAP §3.2). Latched once seen:
  // an active filter shrinks the result set, and reading this from the filtered
  // response would make the control that caused it disappear mid-use.
  const seenFields = useRef({ rate: false, remote: false })
  if (response?.results.length) {
    if (response.results.some((c) => typeof c.rate_from === 'number')) seenFields.current.rate = true
    if (response.results.some((c) => c.remote != null)) seenFields.current.remote = true
  }

  // The count and active filters are now shown as a count + removable chips, so
  // there is no combined summary string; `filter_summary_*` is kept in strings.ts
  // because tenants may override it and removing keys breaks their customisations.
  let errorMessage: string | null = null
  if (count === 0) {
    const locationError = response?.location?.error
    if (locationError === 'rate_limited') errorMessage = config.get_text('no_tutors_found_rate_limited')
    else if (locationError === 'no_results')
      errorMessage = config.get_text('no_tutors_found_no_loc', { location: locationStr })
    else if (locationPretty) errorMessage = config.get_text('no_tutors_found_loc', { location: locationPretty })
    else errorMessage = config.get_text('no_tutors_found')
  }

  const Display = displayMode === 'list' ? List : Grid
  const hasMore =
    !!response && response.count > response.results.length + (page - 1) * config.pagination

  return (
    <div className="tcs-root tw:font-body tw:text-primary">
      {/* One filter row: search inputs and dropdowns sit together rather than in
          two stacked bands, so the controls read as a single toolbar. */}
      <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mb-2">
        <SubjectSelect
          subjects={subjects}
          value={selectedSubject}
          onChange={(s) => navigate(subjectUrl(s))}
        />
        <LocationInput value={locationStr} onChange={setLocationStr} onSubmit={setLocationStr} />
        <RateAndRemoteFilters
          available={seenFields.current}
          remote={remoteOnly}
          rate={rate}
          onRemoteChange={setRemoteOnly}
          onRateChange={setRate}
        />
      </div>

      <div className="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:mb-3">
        <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:min-w-0">
          {typeof count === 'number' && count > 0 && (
            <span className="tw:text-sm tw:text-muted-dark tw:whitespace-nowrap">
              {config.get_text(`tutor_count_${count === 1 ? 'single' : 'plural'}`, { count })}
            </span>
          )}
          {selectedSubject && (
            <FilterChip
              label={selectedSubject.name}
              onRemove={() => navigate(subjectUrl(null))}
            />
          )}
          {locationPretty && (
            <FilterChip label={locationPretty} onRemove={() => setLocationStr(null)} />
          )}
        </div>
        <ViewToggle value={displayMode} onChange={setDisplayMode} />
      </div>

      {isError && <Alert variant="danger">Something went wrong loading tutors. Please try again.</Alert>}

      {!response && isFetching ? (
        <ContractorSkeleton mode={displayMode} count={config.pagination > 8 ? 8 : config.pagination} />
      ) : errorMessage ? (
        <EmptyState title={config.get_text('no_tutors_found')} description={errorMessage} />
      ) : (
        <div className={isFetching ? 'tw:opacity-60 tw:transition-opacity' : undefined}>
          <Display contractors={response?.results ?? []} />
        </div>
      )}

      <Pagination
        page={page}
        hasMore={hasMore}
        onChange={(p) => navigate(pageUrl(selectedSubject, p))}
      />

      {contractorId !== null && (
        <ContractorModal id={contractorId} onClose={() => navigate(lastListUrlRef.current)} />
      )}
    </div>
  )
}
