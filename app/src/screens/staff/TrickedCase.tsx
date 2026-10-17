import { Quote } from 'lucide-react'
import { motion } from 'motion/react'
import { StaffWindow } from '../../ui/devices'
import { day } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { ScriptPanel, SilentCheckPanel, TrustedPanel } from './CheckPanels'
import { plural } from './helpers'
import { CaseHeader, StatusPill } from './parts'
import { trickedFacts } from './trickedFacts'
import { TrickedActions } from './TrickedActions'
import { HoldPanel, WireFacts } from './WirePanels'

/** held: wire on hold, silent check in progress. checked: member shared what she tapped. */
export type TrickedStage = 'held' | 'checked'

export function TrickedCase({ member, stage }: { member: 'M1001'; stage: TrickedStage }) {
  const f = trickedFacts(member)
  return (
    <StaffWindow title={`Wire desk · ${f.caseId}`}>
      <div className="@container space-y-5">
        <CaseHeader
          name={f.name}
          member={member}
          kind={`Wire hold · ${day(f.hit.at)}`}
          caseId={f.caseId}
          pill={
            stage === 'checked' ? (
              <StatusPill tone="danger">On hold · scam pattern</StatusPill>
            ) : (
              <StatusPill tone="warn" live>
                On hold · silent check
              </StatusPill>
            )
          }
        />
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
        <TrickedActions name={f.name} />
        <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <WireFacts f={f} />
            <HoldPanel f={f} />
          </div>
          <div className="space-y-4">
            <SilentCheckPanel f={f} stage={stage} />
            <ScriptPanel f={f} stage={stage} />
            <TrustedPanel f={f} />
          </div>
        </div>
      </div>
    </StaffWindow>
  )
}
