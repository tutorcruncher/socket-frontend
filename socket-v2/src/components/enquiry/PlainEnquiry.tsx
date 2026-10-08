import { EnquiryForm } from './EnquiryForm'

/** Full-page enquiry form (mode: 'enquiry'). */
export function PlainEnquiry() {
  return (
    <div className="tcs-root tw:font-body tw:text-primary tw:max-w-2xl">
      <EnquiryForm mode="plain" />
    </div>
  )
}
