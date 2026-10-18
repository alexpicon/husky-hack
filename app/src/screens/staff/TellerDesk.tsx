import type { ReactNode } from 'react'
import { useReportedCase } from '../../report/report'
import { ReportBanner } from '../../report/ReportBanner'
import { StaffWindow } from '../../ui/devices'
import { JAMES, JAMES_NAME } from '../james/facts'
import { CaseHeader } from './parts'

/** The staff window every James step shares; the member's own report shows on it too. */
export function TellerDesk({
  title,
  kind,
  caseId,
  pill,
  children,
}: {
  title: string
  kind: string
  caseId?: string
  pill: ReactNode
  children: ReactNode
}) {
  const reported = useReportedCase(JAMES)
  return (
    <StaffWindow title={title}>
      <div className="@container space-y-5">
        <CaseHeader name={JAMES_NAME} member={JAMES} kind={kind} caseId={caseId ?? reported} pill={pill} />
        <ReportBanner member={JAMES} />
        {children}
      </div>
    </StaffWindow>
  )
}
