import { useState } from 'react'
import { useConfig } from '@/config/context'
import { useContractor } from '@/api/queries'
import { Modal } from '@/components/ui/Modal'
import { Photo } from '@/components/shared/Photo'
import { Stars } from '@/components/ui/Stars'
import { Button } from '@/components/ui/Button'
import { CenteredSpinner } from '@/components/ui/Spinner'
import { LocationIcon } from '@/components/ui/Icons'
import { ContractorDetails } from './ContractorDetails'
import { EnquiryForm } from '@/components/enquiry/EnquiryForm'

/** Contractor profile modal, with a toggle between profile and an enquiry form. */
export function ContractorModal({ id, onClose }: { id: number; onClose: () => void }) {
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

  return (
    <Modal title={contractor.name} onClose={onClose}>
      <div className="tw:flex tw:flex-col tw:sm:flex-row tw:gap-5">
        <div className="tw:flex tw:flex-col tw:items-center tw:gap-3 tw:sm:w-44 tw:shrink-0">
          <div className="tw:w-40 tw:h-40 tw:rounded-lg tw:overflow-hidden tw:bg-content">
            <Photo src={contractor.photo} alt={contractor.name} className="tw:w-full tw:h-full" />
          </div>
          <Stars contractor={contractor} />
          {contractor.town && (
            <div className="tw:flex tw:items-center tw:gap-1 tw:text-sm tw:text-muted-dark">
              <LocationIcon className="tw:w-3.5 tw:h-3.5" />
              <span>{contractor.town}</span>
            </div>
          )}
          <Button
            variant={showEnquiry ? 'secondary' : 'primary'}
            className="tw:w-full"
            onClick={() => setShowEnquiry((s) => !s)}
          >
            {showEnquiry
              ? config.get_text('contractor_details_button', { contractor_name: contractor.name })
              : config.get_text('contractor_enquiry_button', { contractor_name: contractor.name })}
          </Button>
        </div>

        <div className="tw:flex-1 tw:min-w-0">
          {contractor.tag_line && (
            <div className="tw:text-base tw:text-muted-dark tw:mb-3">{contractor.tag_line}</div>
          )}
          {showEnquiry ? (
            <EnquiryForm mode="con-modal" contractor={contractor} />
          ) : (
            <ContractorDetails contractor={contractor} />
          )}
        </div>
      </div>
    </Modal>
  )
}
