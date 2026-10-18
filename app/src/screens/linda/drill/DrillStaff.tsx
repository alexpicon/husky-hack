import { Check, EyeOff, Headphones } from 'lucide-react'
import { StaffWindow } from '../../../ui/devices'
import { day } from '../../../ui/format'
import { CaseHeader, Panel, StatusPill } from '../../staff/parts'
import { LINDA, LINDA_NAME } from '../facts'
import { staffView, useDrill } from './drillState'
import { DrillSync } from './drillStore'

export const GUESSES_PRIVATE = 'Her guesses are never shown to staff.'

function Status({ children }: { children: string }) {
  return (
    <li className="flex items-center gap-2 text-sm font-semibold text-ink">
      <span className="grid size-5 place-items-center rounded-full bg-safe text-white">
        <Check size={12} strokeWidth={3} aria-hidden />
      </span>
      {children}
    </li>
  )
}

/** The member card on a calm day: whether she did the drill and added someone, and nothing else. */
export function DrillMemberCard({ now }: { now: Date }) {
  const { completed, trustedAdded } = staffView(useDrill())
  return (
    <StaffWindow title={`Member profile · ${LINDA}`}>
      <DrillSync />
      <div className="space-y-5">
        <CaseHeader
          name={LINDA_NAME}
          member={LINDA}
          kind={`Member profile · ${day(now)}`}
          pill={<StatusPill tone="neutral">No payment on hold</StatusPill>}
        />
        <Panel title="Real or AI? drill" icon={<Headphones size={14} />}>
          {completed ? (
            <ul className="space-y-2" aria-label="Drill status">
              <Status>Drill completed</Status>
              {trustedAdded && <Status>Trusted contact added</Status>}
            </ul>
          ) : (
            <p className="text-sm font-semibold text-ink-2">No drill yet</p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
            <EyeOff size={13} aria-hidden /> {GUESSES_PRIVATE}
          </p>
        </Panel>
      </div>
    </StaffWindow>
  )
}

/** One line on her later wire case, once she has done the drill. */
export function DrillStatus() {
  const { completed, trustedAdded } = staffView(useDrill())
  return (
    <>
      <DrillSync />
      {completed && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-slate-50 px-3.5 py-2 text-[13px] text-ink-2 ring-1 ring-line">
          <Headphones size={14} className="text-ink-3" aria-hidden />
          <span className="font-semibold text-ink">Real or AI? drill (concept):</span>
          <span>Drill completed</span>
          {trustedAdded && <span>· Trusted contact added</span>}
          <span className="text-ink-3">· {GUESSES_PRIVATE}</span>
        </p>
      )}
    </>
  )
}
