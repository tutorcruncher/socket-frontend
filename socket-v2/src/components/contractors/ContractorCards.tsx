import { Link } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import type { ContractorSummary, Skill } from '@/api/types'
import { Photo } from '@/components/shared/Photo'
import {
  LocationIcon,
  GridIcon,
  ListIcon,
  VideoIcon,
  CalendarPlusIcon,
  StarIcon,
} from '@/components/ui/Icons'
import type { ResolvedConfig } from '@/config/types'
import { formatDistance } from '@/lib/delivery'
import { cx } from '@/lib/utils'

export type DisplayMode = 'grid' | 'list'

/** Segmented control letting the visitor switch between the grid and list views. */
export function ViewToggle({
  value,
  onChange,
}: {
  value: DisplayMode
  onChange: (mode: DisplayMode) => void
}) {
  const config = useConfig()
  const options: { mode: DisplayMode; Icon: typeof GridIcon; label: string }[] = [
    { mode: 'grid', Icon: GridIcon, label: config.get_text('grid_view') },
    { mode: 'list', Icon: ListIcon, label: config.get_text('list_view') },
  ]
  return (
    <div
      role="group"
      aria-label={config.get_text('view_toggle_label')}
      className="tw:flex tw:items-center tw:gap-0.5 tw:p-0.5 tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm"
    >
      {options.map(({ mode, Icon, label }) => (
        <button
          key={mode}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cx(
            'tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded tw:transition-colors tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link',
            value === mode ? 'tw:bg-primary tw:text-white' : 'tw:text-muted-dark tw:hover:bg-hover',
          )}
        >
          <Icon className="tw:w-3.5 tw:h-3.5" />
        </button>
      ))}
    </div>
  )
}

/**
 * Relative day label for a next-available slot: "today" / "tomorrow" read faster
 * than a date when scanning a list, and beyond that the weekday is what a parent
 * is actually matching against.
 */
function nextAvailableLabel(config: ResolvedConfig, iso: string): string | null {
  const then = new Date(iso + 'Z')
  // A malformed timestamp must not take the whole list down with it: Intl throws
  // on an invalid Date, and this renders once per card.
  if (Number.isNaN(then.getTime())) return null
  const now = new Date()
  const days = Math.round(
    (Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate()) -
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) /
      86_400_000,
  )
  const time = config.format_dt(iso, 'time')
  if (days <= 0) return `today ${time}`
  if (days === 1) return `tomorrow ${time}`
  if (days < 7) return `${config.format_dt(iso, 'weekday')} ${time}`
  // Beyond a week, drop the time: "Aug 15" is enough to judge availability, and
  // the full form wraps to two lines in a grid card. `month_day` exists because
  // `day` alone renders a bare "11" and `month` a bare "Aug".
  return config.format_dt(iso, 'month_day')
}

/**
 * The facts a parent scans before clicking: price, how many people reviewed, and
 * when the tutor is next free (ROADMAP §3.1 / §3.2). Every field is optional: the
 * live API serves none of them yet, so each renders only when present.
 */
function ContractorMeta({
  c,
  showCount = false,
  showRate = false,
  className,
}: {
  c: ContractorSummary
  /** List view has no <InlineRating>, so the review count belongs here instead. */
  showCount?: boolean
  /** Grid view renders the rate in the header row via <RateBadge>; list view here. */
  showRate?: boolean
  className?: string
}) {
  const config = useConfig()
  const hasRate = showRate && typeof c.rate_from === 'number'
  const hasCount = showCount && typeof c.review_count === 'number' && c.review_count > 0
  const nextAvailable = c.next_available ? nextAvailableLabel(config, c.next_available) : null
  if (!hasRate && !hasCount && !nextAvailable && !c.remote) return null

  return (
    <div className={cx('tw:flex tw:flex-wrap tw:items-center tw:gap-x-2 tw:gap-y-0.5 tw:text-xs tw:text-muted-dark', className)}>
      {hasRate && (
        <span className="tw:font-medium tw:text-heading tw:whitespace-nowrap">
          {config.format_money(c.rate_from!)}
          <span className="tw:font-normal tw:text-muted-dark">
            {config.get_text('rate_per_hour')}
          </span>
        </span>
      )}
      {hasCount && (
        <span>{config.get_text('review_count', { count: c.review_count })}</span>
      )}
      {c.remote && (
        <span className="tw:inline-flex tw:items-center tw:gap-1 tw:whitespace-nowrap">
          <VideoIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
          {config.get_text('delivery_online')}
        </span>
      )}
      {nextAvailable && (
        <span className="tw:inline-flex tw:items-center tw:gap-1 tw:whitespace-nowrap">
          <CalendarPlusIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
          {config.get_text('free_from', { when: nextAvailable })}
        </span>
      )}
    </div>
  )
}

/** Price, for the card header row. Right-aligned opposite the name. */
function RateBadge({ c }: { c: ContractorSummary }) {
  const config = useConfig()
  if (typeof c.rate_from !== 'number') return null
  return (
    <span className="tw:text-sm tw:font-semibold tw:text-heading tw:whitespace-nowrap tw:shrink-0">
      {config.format_money(c.rate_from)}
      <span className="tw:text-xs tw:font-normal tw:text-muted-dark">
        {config.get_text('rate_per_hour')}
      </span>
    </span>
  )
}

/** `★ 4.7 · 3 reviews`: one line, so rating and volume read as a single fact. */
function InlineRating({ c }: { c: ContractorSummary }) {
  const config = useConfig()
  if (!config.show_stars || typeof c.review_rating !== 'number') return null
  const count = c.review_count
  return (
    <span className="tw:inline-flex tw:items-center tw:gap-1 tw:text-xs tw:text-muted-dark">
      <StarIcon className="tw:w-3 tw:h-3 tw:text-star tw:shrink-0" />
      <span className="tw:font-medium tw:text-heading">
        {Math.round(c.review_rating * 10) / 10}
      </span>
      {typeof count === 'number' && count > 0 && (
        <span>· {config.get_text('review_count', { count })}</span>
      )}
    </span>
  )
}

/**
 * Subjects and qualification levels from `skills`. The live list endpoint does not
 * return `skills` (only the per-contractor detail endpoint does), so this renders
 * only where a backend supplies it and is omitted entirely otherwise.
 */
function SkillSummary({ skills }: { skills: Skill[] | undefined }) {
  if (!skills?.length) return null
  const subjects = skills.map((s) => s.subject).filter(Boolean)
  const levels = [...new Set(skills.flatMap((s) => s.qual_levels))].filter(Boolean)
  if (!subjects.length && !levels.length) return null
  return (
    <div className="tw:mt-1.5 tw:min-w-0">
      {subjects.length > 0 && (
        <div className="tw:text-sm tw:text-primary tw:truncate">{subjects.join(', ')}</div>
      )}
      {levels.length > 0 && (
        <div className="tw:text-xs tw:text-muted-dark tw:truncate">{levels.join(' · ')}</div>
      )}
    </div>
  )
}

/**
 * Grid view: two columns of wide cards. Each card leads with name + price on one
 * row so both sit at a fixed position for scanning down a column, then rating,
 * subjects, and the delivery/availability qualifiers.
 */
export function Grid({ contractors }: { contractors: ContractorSummary[] }) {
  const url = useUrl()
  return (
    <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-3">
      {contractors.map((c) => (
        <Link
          key={c.id}
          to={url(c.link)}
          className="tw:group tw:flex tw:gap-3 tw:h-full tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:p-3 tw:transition-shadow tw:hover:shadow-md tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link tw:focus-visible:outline-offset-2"
        >
          <Photo
            src={c.photo}
            alt={c.name}
            className="tw:w-12 tw:h-12 tw:rounded-lg tw:shrink-0 tw:overflow-hidden"
          />
          {/* `justify-between` pins the qualifier row to the bottom, so cards in a
              row stay aligned even when one lacks a rating or subject line. */}
          <div className="tw:flex tw:flex-col tw:flex-1 tw:min-w-0">
            <div className="tw:flex tw:items-baseline tw:justify-between tw:gap-2">
              <h3 className="tw:text-sm tw:font-medium tw:text-heading tw:truncate">{c.name}</h3>
              <RateBadge c={c} />
            </div>
            <InlineRating c={c} />
            <SkillSummary skills={c.skills} />
            <ContractorMeta c={c} className="tw:mt-auto tw:pt-1.5" />
          </div>
        </Link>
      ))}
    </div>
  )
}

/** `★ 4.7 (3)`: the list's tighter rating form, sitting inline after the name. */
function CompactRating({ c }: { c: ContractorSummary }) {
  const config = useConfig()
  if (!config.show_stars || typeof c.review_rating !== 'number') return null
  const count = c.review_count
  return (
    <span className="tw:inline-flex tw:items-center tw:gap-0.5 tw:text-xs tw:text-muted-dark tw:shrink-0">
      <StarIcon className="tw:w-3 tw:h-3 tw:text-star" />
      <span className="tw:font-medium tw:text-heading">
        {(Math.round(c.review_rating * 10) / 10).toFixed(1)}
      </span>
      {typeof count === 'number' && count > 0 && <span>({count})</span>}
    </span>
  )
}

/** "Free from Aug 12", when the tutor has a next slot. */
function NextAvailable({ c }: { c: ContractorSummary }) {
  const config = useConfig()
  const when = c.next_available ? nextAvailableLabel(config, c.next_available) : null
  if (!when) return null
  return (
    <span className="tw:inline-flex tw:items-center tw:gap-1 tw:whitespace-nowrap">
      <CalendarPlusIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
      {config.get_text('free_from', { when })}
    </span>
  )
}

/**
 * Flatten a markdown bio to plain text for the list's two-line clamp.
 *
 * `line-clamp` needs a single text block: rendering the markdown here would emit
 * block children (paragraphs, lists) that each clamp independently, so a bio with
 * two paragraphs would show two lines *each* rather than two lines total.
 */
function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[>\s]*[-*+]\s+/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Subject names as chips, with the qualification levels beside them. */
function SkillChips({ skills }: { skills: Skill[] | undefined }) {
  if (!skills?.length) return null
  const levels = [...new Set(skills.flatMap((s) => s.qual_levels))].filter(Boolean)
  return (
    <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-1.5 tw:mt-1">
      {skills.map((s, i) => (
        <span
          key={i}
          className="tw:inline-flex tw:items-center tw:rounded tw:bg-hover tw:px-1.5 tw:py-0.5 tw:text-xs tw:text-primary"
        >
          {s.subject}
        </span>
      ))}
      {levels.length > 0 && (
        <span className="tw:text-xs tw:text-muted-dark">{levels.join(' · ')}</span>
      )}
    </div>
  )
}

/**
 * List view: one bordered container of divider-separated rows. Denser than the
 * grid: full bio line, subject chips, and an explicit "View profile" action, so a
 * parent can compare tutors without opening each profile.
 */
export function List({ contractors }: { contractors: ContractorSummary[] }) {
  const config = useConfig()
  const url = useUrl()
  return (
    <div className="tw:bg-white tw:border tw:border-default tw:rounded-lg tw:shadow-sm tw:divide-y tw:divide-default tw:overflow-hidden">
      {contractors.map((c) => (
        <Link
          key={c.id}
          to={url(c.link)}
          className="tw:group tw:flex tw:items-start tw:gap-3 tw:p-3 tw:sm:p-4 tw:transition-colors tw:hover:bg-content tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-offset-[-2px] tw:focus-visible:outline-link"
        >
          <Photo
            src={c.photo}
            alt={c.name}
            className="tw:w-12 tw:h-12 tw:sm:w-14 tw:sm:h-14 tw:rounded-lg tw:shrink-0 tw:overflow-hidden"
          />

          <div className="tw:flex-1 tw:min-w-0">
            <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-2 tw:gap-y-0.5">
              <h3 className="tw:text-sm tw:font-medium tw:text-heading tw:truncate">{c.name}</h3>
              <CompactRating c={c} />
            </div>
            <SkillChips skills={c.skills} />
            {c.primary_description && (
              <p className="tw:text-sm tw:text-primary tw:mt-1 tw:line-clamp-2">
                {stripMarkdown(c.primary_description)}
              </p>
            )}
            <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-2 tw:gap-y-0.5 tw:mt-1.5 tw:text-xs tw:text-muted-dark">
              {typeof c.rate_from === 'number' && (
                <span className="tw:font-medium tw:text-heading tw:whitespace-nowrap">
                  {config.format_money(c.rate_from)}
                  <span className="tw:font-normal tw:text-muted-dark">
                    {config.get_text('rate_per_hour')}
                  </span>
                </span>
              )}
              {c.remote && (
                <span className="tw:inline-flex tw:items-center tw:gap-1 tw:whitespace-nowrap">
                  <VideoIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
                  {config.get_text('delivery_online')}
                </span>
              )}
              {c.town && (
                <span className="tw:inline-flex tw:items-center tw:gap-1 tw:min-w-0">
                  <LocationIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
                  <span className="tw:truncate">{c.town}</span>
                  {c.distance !== null && <span>· {formatDistance(config, c.distance)}</span>}
                </span>
              )}
              <NextAvailable c={c} />
            </div>
          </div>

          {/* Visual affordance only: the whole row is the link, so this must not
              be a nested <button>/<a>, which would be invalid and steal the click. */}
          <span className="tw:tc-view-profile tw:hidden tw:sm:inline-flex tw:items-center tw:justify-center tw:shrink-0 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:rounded-lg tw:border tw:border-default tw:bg-white tw:text-primary tw:transition-colors tw:group-hover:bg-primary tw:group-hover:text-white tw:group-hover:border-primary">
            {config.get_text('view_profile')}
          </span>
        </Link>
      ))}
    </div>
  )
}
