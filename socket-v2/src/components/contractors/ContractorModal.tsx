import { useState } from 'react'
import { useConfig } from '@/config/context'
import { useContractor } from '@/api/queries'
import { Modal } from '@/components/ui/Modal'
import { Photo } from '@/components/shared/Photo'
import { Button } from '@/components/ui/Button'
import { CenteredSpinner } from '@/components/ui/Spinner'
import {
  LocationIcon,
  StarIcon,
  CalendarPlusIcon,
  VideoIcon,
} from '@/components/ui/Icons'
import type { Contractor } from '@/api/types'
import { ContractorDetails } from './ContractorDetails'
import { EnquiryForm } from '@/components/enquiry/EnquiryForm'

/**
 * Contractor profile modal, with a toggle between profile and an enquiry form.
 * `profileOnly` drops the rate/availability card and "Contact" action: opened from
 * a lesson being booked, the lesson's own price and time are what apply, and an
 * enquiry would pull the parent out of the booking.
 */
export function ContractorModal({
  id,
  onClose,
  profileOnly = false,
}: {
  id: number
  onClose: () => void
  profileOnly?: boolean
}) {
  const config = useConfig()
  const { data: contractor, isLoading } = useContractor(id)
  const [showEnquiry, setShowEnquiry] = useState(false)

  if (isLoading) {
    return (
      <Modal title={config.get_text('loading')} onClose={onClose}>
        <CenteredSpinner />
      </Modal>
    )
  }

  if (!contractor) {
    return (
      <Modal title={config.get_text('contractor_not_found')} onClose={onClose}>
        <p>{config.get_text('contractor_not_found_id', { contractor_id: id })}</p>
      </Modal>
    )
  }

  const firstName = contractor.name.split(/\s+/)[0] || contractor.name
  const rating = contractor.review_rating
  const count = contractor.review_count

  const header = (
    <div className="tw:flex tw:items-start tw:gap-3 tw:min-w-0">
      <Photo
        src={contractor.photo}
        alt={contractor.name}
        className="tw:w-12 tw:h-12 tw:sm:w-14 tw:sm:h-14 tw:rounded-lg tw:shrink-0 tw:overflow-hidden"
      />
      <div className="tw:min-w-0">
        <h2 className="tw:font-medium tw:font-heading tw:text-lg tw:sm:text-xl tw:m-0 tw:truncate">
          {contractor.name}
        </h2>
        {contractor.tag_line && (
          <div className="tw:text-sm tw:text-muted-dark tw:truncate">{contractor.tag_line}</div>
        )}
        <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-x-3 tw:gap-y-0.5 tw:mt-0.5 tw:text-xs tw:text-muted-dark">
          {config.show_stars && typeof rating === 'number' && (
            <span className="tw:inline-flex tw:items-center tw:gap-1">
              <StarIcon className="tw:w-3 tw:h-3 tw:text-star tw:shrink-0" />
              <span className="tw:font-medium tw:text-heading">{Math.round(rating * 10) / 10}</span>
              {typeof count === 'number' && count > 0 && (
                <span>· {config.get_text('review_count', { count })}</span>
              )}
            </span>
          )}
          {contractor.town && (
            <span className="tw:inline-flex tw:items-center tw:gap-1 tw:min-w-0">
              <LocationIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
              <span className="tw:truncate">{contractor.town}</span>
              {contractor.remote && <span>· {config.get_text('delivery_online')}</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Modal title={contractor.name} header={header} onClose={onClose} size="lg">
      {profileOnly ? (
        <ContractorDetails contractor={contractor} />
      ) : showEnquiry ? (
        <div className="tw:flex tw:flex-col tw:gap-4">
          <EnquiryForm mode="con-modal" contractor={contractor} />
          <Button variant="secondary" onClick={() => setShowEnquiry(false)}>
            {config.get_text('contractor_details_button', { contractor_name: contractor.name })}
          </Button>
        </div>
      ) : (
        // Single column on mobile with the action card first (so "Contact" is
        // reachable without scrolling past the whole profile); two columns from
        // `md` up, where the card becomes a sticky sidebar.
        <div className="tw:flex tw:flex-col tw:md:flex-row-reverse tw:gap-5 tw:md:gap-6">
          <div className="tw:md:w-56 tw:shrink-0">
            <ContactCard
              contractor={contractor}
              firstName={firstName}
              onContact={() => setShowEnquiry(true)}
            />
          </div>
          <div className="tw:flex-1 tw:min-w-0">
            <ContractorDetails contractor={contractor} />
          </div>
        </div>
      )}
    </Modal>
  )
}

/** Price, availability and the primary call to action. */
function ContactCard({
  contractor,
  firstName,
  onContact,
}: {
  contractor: Contractor
  firstName: string
  onContact: () => void
}) {
  const config = useConfig()
  const hasRate = typeof contractor.rate_from === 'number'
  const nextAvailable = contractor.next_available
  return (
    <div className="tw:bg-content tw:border tw:border-default tw:rounded-lg tw:p-4 tw:md:sticky tw:md:top-0">
      {hasRate && (
        <div className="tw:mb-3">
          <div className="tw:text-xs tw:text-muted-dark">{config.get_text('rate_from_label')}</div>
          <div className="tw:text-2xl tw:font-semibold tw:text-heading tw:leading-tight">
            {config.format_money(contractor.rate_from!)}
            <span className="tw:text-sm tw:font-normal tw:text-muted-dark">
              {config.get_text('rate_per_hour')}
            </span>
          </div>
        </div>
      )}
      {(nextAvailable || contractor.remote) && (
        <div className="tw:flex tw:flex-col tw:gap-1 tw:mb-3 tw:text-xs tw:text-muted-dark">
          {nextAvailable && (
            <span className="tw:inline-flex tw:items-center tw:gap-1.5">
              <CalendarPlusIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
              {config.get_text('free_from', { when: config.format_dt(nextAvailable, 'month_day') })}
            </span>
          )}
          {contractor.remote && (
            <span className="tw:inline-flex tw:items-center tw:gap-1.5">
              <VideoIcon className="tw:w-3 tw:h-3 tw:shrink-0" />
              {config.get_text('online_lessons')}
            </span>
          )}
        </div>
      )}
      <Button className="tw:w-full tw:py-2.5" onClick={onContact}>
        {config.get_text('contact_first_name', { name: firstName })}
      </Button>
    </div>
  )
}
