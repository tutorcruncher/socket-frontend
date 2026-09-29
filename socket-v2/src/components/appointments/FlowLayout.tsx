import type { ReactNode } from 'react'
import { useConfig } from '@/config/context'
import { cx } from '@/lib/utils'
import { CheckIcon } from '@/components/ui/Icons'

export type FlowStepId = 'time' | 'details' | 'review' | 'payment' | 'confirmed'

interface FlowStep {
  id: FlowStepId
  label: string
}

/**
 * Booking flow shell: the current step under a numbered stepper, with an optional
 * summary rail on the left that fills in as choices are made. The calendar step
 * renders without a rail (the calendar needs the width); once a slot is chosen the
 * checkout steps carry the rail. Shared across the routed boundary
 * (`#/appointment/:id`) so the stepper stays continuous.
 */
export function FlowLayout({
  stepId,
  title,
  intro,
  headerAside,
  rail,
  railOnMobile = true,
  includePayment,
  children,
}: {
  stepId: FlowStepId
  /** Replaces the step label as the heading, e.g. "Your lesson is booked". */
  title?: string
  intro?: string
  /** Shown beside the step title (wrapping below it when narrow), e.g. search chips. */
  headerAside?: ReactNode
  /** Summary sidebar; omit to let the step content span the full width. */
  rail?: ReactNode
  /** False hides the rail below `lg`, for steps that carry their own summary. */
  railOnMobile?: boolean
  /** Whether a payment step exists for this booking; defaults to the tenant config. */
  includePayment?: boolean
  children: ReactNode
}) {
  const config = useConfig()
  const withPayment = includePayment ?? !!config.payment?.required
  const steps: FlowStep[] = [
    { id: 'time', label: config.get_text('apt_step_time') },
    { id: 'details', label: config.get_text('apt_step_details') },
    { id: 'review', label: config.get_text('apt_step_review') },
    ...(withPayment
      ? [{ id: 'payment' as const, label: config.get_text('apt_step_payment') }]
      : []),
    { id: 'confirmed', label: config.get_text('apt_step_confirmed') },
  ]
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.id === stepId),
  )

  const section = (
    <section className="tw:order-1 tw:lg:order-2 tw:bg-white tw:border tw:border-default tw:rounded-xl tw:shadow-sm tw:p-4 tw:sm:p-6 tw:flex tw:flex-col tw:gap-5">
      {/* Stepper leads so progress sits in the same place on every step; the step's
          own title and intro follow it. */}
      <Stepper steps={steps} current={idx} />

      <header className="tw:border-t tw:border-default tw:pt-5 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-x-6 tw:gap-y-3">
        <div className="tw:min-w-0">
          <h2 className="tw:text-2xl tw:font-medium tw:font-heading">{title ?? steps[idx].label}</h2>
          {intro && <p className="tw:text-sm tw:text-muted-dark tw:mt-1">{intro}</p>}
        </div>
        {headerAside}
      </header>

      <div className="tw:flex tw:flex-col tw:gap-4">{children}</div>
    </section>
  )

  if (!rail) return section

  return (
    <div className="tw:grid tw:gap-4 tw:lg:gap-6 tw:lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] tw:items-start">
      {/* On mobile the step comes first: the summary is context, not the task. */}
      <aside
        className={cx(
          'tw:order-2 tw:lg:order-1 tw:bg-content tw:border tw:border-default tw:rounded-xl tw:p-5 tw:lg:sticky tw:lg:top-4',
          !railOnMobile && 'tw:hidden tw:lg:block',
        )}
      >
        {rail}
      </aside>
      {section}
    </div>
  )
}

function Stepper({ steps, current }: { steps: FlowStep[]; current: number }) {
  return (
    <ol className="tw:flex">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={s.id}
            aria-current={active ? 'step' : undefined}
            className="tw:flex-1 tw:relative tw:flex tw:flex-col tw:items-center tw:gap-1.5 tw:min-w-0"
          >
            {/* Connector back to the previous circle. */}
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cx(
                  'tw:absolute tw:top-[15px] tw:left-[calc(-50%+22px)] tw:right-[calc(50%+22px)]',
                  // No `bg-default` token exists; inactive lines borrow the border colour.
                  done || active
                    ? 'tw:h-0.5 tw:bg-primary'
                    : 'tw:h-0 tw:border-t tw:border-default',
                )}
              />
            )}
            <span
              className={cx(
                'tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded-full tw:text-sm tw:font-semibold tw:shrink-0',
                done || active
                  ? 'tw:bg-primary tw:text-white'
                  : 'tw:bg-white tw:border tw:border-default tw:text-muted-dark',
                active && 'tw:outline tw:outline-2 tw:outline-offset-2 tw:outline-primary/30',
              )}
            >
              {done ? <CheckIcon className="tw:w-3.5 tw:h-3.5" /> : i + 1}
            </span>
            {/* Phones only have room for the current step's label. */}
            <span
              className={cx(
                'tw:text-xs tw:text-center tw:leading-tight tw:px-1',
                active
                  ? 'tw:block tw:text-primary tw:font-semibold'
                  : 'tw:hidden tw:sm:block tw:text-muted-dark',
              )}
            >
              {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
