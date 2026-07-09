import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import { useContractors, useSubjects } from '@/api/queries'
import { slugify } from '@/lib/utils'
import type { Subject } from '@/api/types'
import { Grid, List } from './ContractorCards'
import { SubjectSelect, LocationInput } from './Filters'
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

  let errorMessage: string | null = null
  let summary: string | null = null
  if (count === 0) {
    const locationError = response?.location?.error
    if (locationError === 'rate_limited') errorMessage = config.get_text('no_tutors_found_rate_limited')
    else if (locationError === 'no_results')
      errorMessage = config.get_text('no_tutors_found_no_loc', { location: locationStr })
    else if (locationPretty) errorMessage = config.get_text('no_tutors_found_loc', { location: locationPretty })
    else errorMessage = config.get_text('no_tutors_found')
  } else if (count && count > 0) {
    summary = [
      locationPretty,
      selectedSubject?.name,
      config.get_text(`filter_summary_${count === 1 ? 'single' : 'plural'}`, { count }),
    ]
      .filter(Boolean)
      .join(' • ')
  }

  const displayMode = config.mode === 'list' ? 'list' : 'grid'
  const Display = displayMode === 'list' ? List : Grid
  const hasMore =
    !!response && response.count > response.results.length + (page - 1) * config.pagination

  return (
    <div className="tcs-root tw:font-body tw:text-primary">
      {(config.show_subject_filter || config.show_location_search) && (
        <div className="tw:flex tw:flex-wrap tw:gap-3 tw:mb-3">
          <LocationInput value={locationStr} onChange={setLocationStr} onSubmit={setLocationStr} />
          <SubjectSelect
            subjects={subjects}
            value={selectedSubject}
            onChange={(s) => navigate(subjectUrl(s))}
          />
        </div>
      )}

      {summary && <div className="tw:text-sm tw:text-muted-dark tw:mb-3">{summary}</div>}

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
