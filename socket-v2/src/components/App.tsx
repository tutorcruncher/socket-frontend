import { useConfig } from '@/config/context'
import { Contractors } from './contractors/Contractors'
import { PlainEnquiry } from './enquiry/PlainEnquiry'
import { EnquiryButton } from './enquiry/EnquiryButton'
import { Appointments } from './appointments/Appointments'

/** Renders the section matching the configured mode. Each section owns its routing. */
export function App() {
  const { mode } = useConfig()
  switch (mode) {
    case 'enquiry':
      return <PlainEnquiry />
    case 'enquiry-modal':
      return <EnquiryButton />
    case 'appointments':
      return <Appointments />
    case 'grid':
    case 'list':
    default:
      return <Contractors />
  }
}
