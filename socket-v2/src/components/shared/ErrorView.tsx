import { Alert } from '@/components/ui/Alert'

/** Top-level error display used when the widget can't initialise or load data. */
export function ErrorView({ children }: { children: React.ReactNode }) {
  return (
    <div className="tcs-root tw:p-4">
      <Alert variant="danger">{children}</Alert>
    </div>
  )
}
