import { useConfig } from '@/config/context'
import { Contractors } from './contractors/Contractors'
import { PlainEnquiry } from './enquiry/PlainEnquiry'
import { EnquiryButton } from './enquiry/EnquiryButton'
import { Appointments } from './appointments/Appointments'
import { Packages } from './packages/Packages'
import { PoweredBy } from './shared/PoweredBy'

function Section() {
  const { mode } = useConfig()
  switch (mode) {
    case 'enquiry':
      return <PlainEnquiry />
    case 'enquiry-modal':
      return <EnquiryButton />
    case 'appointments':
      return <Appointments />
    case 'packages':
      return <Packages />
    case 'tutors':
    default:
      return <Contractors />
  }
}

/**
 * Renders the section matching the configured mode. Each section owns its routing.
 *
 * Attribution is added here rather than inside each view: `Appointments` alone
 * returns from six branches, and per-view banners would render two or none
 * depending on which step is showing. One wrapper means exactly one banner per
 * embed. Modals carry their own (they portal outside this tree).
 */
export function App() {
  const { mode } = useConfig()
  return (
    <>
      <Section />
      {/* The enquiry-modal mode renders only a button on the host page: a footer
          rule under it would read as a stray divider, and the modal it opens
          already carries the branding. */}
      {mode !== 'enquiry-modal' && (
        <div className="tcs-root tw:font-body">
          <PoweredBy />
        </div>
      )}
    </>
  )
}
