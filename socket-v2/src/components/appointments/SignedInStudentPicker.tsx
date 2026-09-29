import { useMemo, useState } from 'react'
import { useConfig } from '@/config/context'
import type { AppointmentAuth } from '@/lib/useAppointmentAuth'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/Icons'
import { cx } from '@/lib/utils'
import { FIELD_BASE, FIELD_BORDER } from '@/components/ui/fieldStyles'

/** Who is the lesson for? Shown when the client is already signed in via SSO. */
export function SignedInStudentPicker({
  auth,
  attendeeIds,
  submitting,
  disabled,
  onChoose,
}: {
  auth: AppointmentAuth
  attendeeIds: Set<number>
  submitting: boolean
  disabled: boolean
  onChoose: (studentId: number | undefined, studentName: string) => void
}) {
  const config = useConfig()
  const [newStudent, setNewStudent] = useState('')

  const students = useMemo(() => {
    if (!auth.session) return []
    return Object.entries(auth.session.srs).map(([k, name]) => {
      const id = parseInt(k, 10)
      return { id, name, alreadyOnApt: attendeeIds.has(id) }
    })
  }, [auth.session, attendeeIds])

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {students.length > 0 && (
        <div>
          <div className="tw:text-sm tw:font-medium tw:mb-2">
            {config.get_text('add_existing_students')}
          </div>
          <div className="tw:flex tw:flex-col tw:gap-2">
            {students.map((s) => (
              <div
                key={s.id}
                className="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:px-3 tw:py-2 tw:bg-content tw:border tw:border-default tw:rounded-lg"
              >
                <span className="tw:text-sm">{s.name}</span>
                {s.alreadyOnApt ? (
                  <span className="tw:inline-flex tw:items-center tw:gap-1 tw:text-sm tw:text-success">
                    {config.get_text('added')} <CheckIcon className="tw:w-3.5 tw:h-3.5" />
                  </span>
                ) : (
                  <Button
                    size="small"
                    disabled={submitting || disabled}
                    onClick={() => onChoose(s.id, s.name)}
                  >
                    {config.get_text('add_to_lesson')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="tw:text-sm tw:font-medium tw:mb-2">
          {config.get_text('add_new_student')}
        </div>
        <div className="tw:flex tw:gap-2">
          <input
            type="text"
            placeholder="Student Name"
            maxLength={255}
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
            className={cx(FIELD_BASE, FIELD_BORDER, 'tw:flex-1')}
          />
          <Button
            disabled={submitting || disabled || !newStudent.trim()}
            onClick={() => onChoose(undefined, newStudent.trim())}
          >
            {config.get_text('add_to_lesson')}
          </Button>
        </div>
      </div>

      <div className="tw:text-sm tw:text-muted-dark tw:pt-3 tw:border-t tw:border-default">
        {auth.session?.nm}
        <button
          type="button"
          onClick={auth.signout}
          className="tw:ml-2 tw:text-link tw:hover:underline tw:rounded tw:outline-none tw:focus-visible:outline-2 tw:focus-visible:outline-link"
        >
          {config.get_text('not_you_sign_out')}
        </button>
      </div>
    </div>
  )
}
