import { Quote } from 'lucide-react'
import { motion } from 'motion/react'
import { useReportedCase } from '../../report/report'
import { ReportBanner } from '../../report/ReportBanner'
import { StaffWindow } from '../../ui/devices'
import { day } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { useLindaCase, type LindaCase } from '../linda/lindaCase'
import { outcomeCopy } from '../linda/outcomes'
import { nameScam } from '../linda/scams'
import { ScriptPanel, SilentCheckPanel, TrustedPanel } from './CheckPanels'
import { plural } from './helpers'
import { CaseHeader, StatusPill } from './parts'
import { trickedFacts } from './trickedFacts'
import { TrickedActions } from './TrickedActions'
import { WhyPaused } from './WhyPaused'
import { whyTricked } from './pauseReasons'
import { HoldPanel, WireFacts } from './WirePanels'

/** held: wire on hold, silent check in progress. checked: she has finished the check. */
export type TrickedStage = 'held' | 'checked'

function CasePill({ state, stage }: { state: LindaCase; stage: TrickedStage }) {
  if (state.outcome) {
    const ending = outcomeCopy(state.outcome)
    return <StatusPill tone={ending.tone}>{ending.status}</StatusPill>
  }
  if (state.staffActions.includes('escalated')) {
    return <StatusPill tone="danger">On hold · escalated</StatusPill>
  }
  if (stage !== 'checked') {
    return (
      <StatusPill tone="warn" live>
        On hold · silent check
      </StatusPill>
    )
  }
  if (state.shared && nameScam(state.taps)) {
    return <StatusPill tone="danger">On hold · scam pattern</StatusPill>
  }
  return <StatusPill tone="warn">On hold · check finished</StatusPill>
}

/** `now` is the story clock: the case never shows a kit event from after it. */
export function TrickedCase({
  member,
  stage,
  now,
}: {
  member: 'M1001'
  stage: TrickedStage
  now: Date
}) {
  const f = trickedFacts(member)
  const { state } = useLindaCase()
  const reportedCase = useReportedCase(member)
  const caseId = state.staffActions.includes('case-opened') ? f.caseId : reportedCase
  return (
    <StaffWindow title={`Wire desk · ${caseId ?? `Hold on ${f.hit.paymentId}`}`}>
      <div className="@container space-y-5">
        <CaseHeader
          name={f.name}
          member={member}
          kind={`Wire hold · ${day(f.hit.at)}`}
          caseId={caseId}
          pill={<CasePill state={state} stage={stage} />}
        />
        <WhyPaused why={whyTricked(f)} />
        <ReportBanner member={member} />
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-white p-5 ring-1 ring-amber-200"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">
            <Quote size={13} />
            Sound's fact, the first line {f.name} sees
          </div>
          <p className="mt-1.5 font-display text-[30px] leading-tight tracking-tight text-ink">
            This would be your first wire in {plural(f.yearsSinceSameRail, 'year')}, to an account
            added {plural(f.minutesSinceAdded, 'minute')} ago.
          </p>
          <div className="mt-1.5">
            <Source ids={[f.hit.id, f.recipientAdded.id]} />
          </div>
        </motion.div>
        <TrickedActions f={f} now={now} />
        <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <WireFacts f={f} />
            <HoldPanel f={f} now={now} />
          </div>
          <div className="space-y-4">
            <SilentCheckPanel f={f} stage={stage} now={now} />
            <ScriptPanel f={f} stage={stage} />
            <TrustedPanel f={f} />
          </div>
        </div>
      </div>
    </StaffWindow>
  )
}
