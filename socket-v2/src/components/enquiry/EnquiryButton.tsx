import { useLocation, useNavigate } from 'react-router-dom'
import { useConfig, useUrl } from '@/config/context'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EnquiryForm } from './EnquiryForm'

/** "Get in touch" button that opens the enquiry form in a modal (mode: 'enquiry-modal'). */
export function EnquiryButton() {
  const config = useConfig()
  const url = useUrl()
  const navigate = useNavigate()
  const loc = useLocation()
  const open = loc.pathname.replace(url(''), '').replace(/^\//, '') === 'enquiry'

  return (
    <div className="tcs-root tw:font-body tw:text-primary">
      <Button onClick={() => navigate(url('enquiry'))}>{config.get_text('enquiry_button')}</Button>
      {open && (
        <Modal title={config.get_text('enquiry_title')} onClose={() => navigate(url(''))}>
          <EnquiryForm mode="modal" />
        </Modal>
      )}
    </div>
  )
}
