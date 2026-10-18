import { Headset, Link2 } from 'lucide-react'
import { HEADS_UP_WINDOW_HOURS } from '../../data/jamesRules'
import { clock, day } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { JAMES_NAME, jamesFacts } from '../james/facts'
import { FactRow, Panel, StatusPill } from './parts'
import { TellerDesk } from './TellerDesk'

/** Step one: the record Sound's contact center already keeps of James's call. */
export function TellerCall() {
  const { call } = jamesFacts()
  return (
    <TellerDesk
      title="Contact center · call record"
      kind={`Contact center call · ${day(call.at)}`}
      pill={<StatusPill tone="neutral">Call logged</StatusPill>}
    >
      <Panel title="The call" icon={<Headset size={14} />}>
        <div className="divide-y divide-line/70">
          <FactRow label="When">
            <span className="font-mono">{clock(call.at)}</span> · {day(call.at)}
          </FactRow>
          <FactRow label="Channel">{call.channel}</FactRow>
          <FactRow label="Payment">{call.paymentId || 'None'}</FactRow>
        </div>
        <figure className="mt-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-line ring-inset">
          <figcaption className="text-xs font-semibold text-ink-3">The contact center's own note</figcaption>
          <blockquote className="mt-1 text-[17px] leading-snug font-medium text-ink">"{call.note}"</blockquote>
          <p className="mt-1.5 text-xs text-ink-3">
            In production this would be a call reason code. <Source ids={call.id} />
          </p>
        </figure>
      </Panel>
      <Panel title="What Second Look adds" icon={<Link2 size={14} />} delay={0.05}>
        <p className="text-sm leading-relaxed text-ink-2">
          Sound already keeps this record. For the next {HEADS_UP_WINDOW_HOURS} hours, a cash or wire
          payment {JAMES_NAME} starts puts a heads-up in front of
          the teller. The rule reads that a call happened, never what was said.
        </p>
      </Panel>
    </TellerDesk>
  )
}
