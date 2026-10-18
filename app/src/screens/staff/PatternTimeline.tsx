import { FolderOpen } from 'lucide-react'
import { FOLLOW_UP_WINDOW_DAYS } from '../../data/michaelRules'
import { money } from '../../ui/format'
import { Timeline } from '../../ui/timeline'
import { useMichaelCheck } from '../michael/checkState'
import { dollars, type MichaelFacts } from '../michael/facts'
import { caseTimeline, heldWires } from './michaelCase'
import { Panel, StatusPill } from './parts'

export function OneCasePanel({ f, now }: { f: MichaelFacts; now: Date }) {
  const { state } = useMichaelCheck()
  return (
    <Panel
      title="One case · from the pattern card"
      icon={<FolderOpen size={14} />}
      aside={<StatusPill tone="warn">{heldWires(f, now).length} wires held for a call</StatusPill>}
    >
      <Timeline compact items={caseTimeline(f, now, state)} />
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">While the case is open</span> (from the card, up to{' '}
        {FOLLOW_UP_WINDOW_DAYS} days), every wire or external transfer to this account is held for a call. In the
        kit, {dollars(f.wired)} of his {money(f.sent)} moved after the turn to wires. A call is not a refusal: he
        decides, and none of it is money saved.
      </p>
    </Panel>
  )
}
