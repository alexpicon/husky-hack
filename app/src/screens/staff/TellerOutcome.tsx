import { History, Scale } from 'lucide-react'
import { clock, day } from '../../ui/format'
import { Timeline, type TimelineItem } from '../../ui/timeline'
import { QUESTION } from '../james/copy'
import { JAMES_NAME, jamesFacts } from '../james/facts'
import { answer } from '../james/outcome'
import { dollars } from '../linda/facts'
import { plural } from './helpers'
import { Panel, StatusPill } from './parts'
import { TellerDesk } from './TellerDesk'

function items(): TimelineItem[] {
  const f = jamesFacts()
  const amount = dollars(f.cash.amount)
  return [
    {
      time: clock(f.cash.at),
      label: `Cash withdrawal started: ${amount}`,
      detail: 'Heads-up on the teller screen',
      tone: 'warn',
      source: f.cash.id,
    },
    {
      time: clock(f.confirm.at),
      label: 'Teller asks the question',
      detail: `"${QUESTION}" He ${answer(f.confirm.memberResponse)}.`,
      tone: 'brand',
      source: f.confirm.id,
    },
    { time: clock(f.escalated.at), label: 'Escalated to a specialist', tone: 'brand', source: f.escalated.id },
    {
      time: clock(f.offered.at),
      label: 'Trusted contact offered',
      detail: `He ${answer(f.offered.memberResponse)}`,
      tone: 'brand',
      source: f.offered.id,
    },
    { time: clock(f.enrolled.at), label: 'Trusted contact enrolled', tone: 'brand', source: f.enrolled.id },
    {
      time: clock(f.cancelled.at),
      label: `Withdrawal cancelled by ${JAMES_NAME}`,
      detail: `${amount} stays in his account`,
      tone: 'safe',
      source: f.cancelled.id,
    },
    { time: clock(f.opened.at), label: 'Case opened', detail: f.caseId, source: f.opened.id },
  ]
}

/** Step three: how the kit's afternoon ended, and what the heads-up changes for every other teller. */
export function TellerOutcome() {
  const f = jamesFacts()
  const out = f.elsewhere
  return (
    <TellerDesk
      title={`Teller line · ${f.caseId}`}
      kind={`Cash withdrawal · ${day(f.cash.at)}`}
      caseId={f.caseId}
      pill={<StatusPill tone="safe">Withdrawal cancelled</StatusPill>}
    >
      <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel title="This afternoon" icon={<History size={14} />}>
          <Timeline items={items()} compact />
        </Panel>
        <Panel title="The kit, side by side" icon={<Scale size={14} />} delay={0.05}>
          <p className="text-[15px] leading-relaxed text-ink-2">
            <span className="font-semibold text-ink">In the kit, without Second Look:</span> the teller
            asked this question and the {dollars(f.cash.amount)} stayed with {JAMES_NAME}. In{' '}
            {plural(out.payments.length, 'other government journey')},{' '}
            <span className="font-semibold text-danger">{dollars(out.total)}</span> in cash went out.
          </p>
          <p className="mt-3 rounded-xl bg-warn-soft px-3.5 py-3 text-[15px] leading-snug font-semibold text-ink ring-1 ring-amber-200 ring-inset">
            The heads-up puts this question in front of every teller, every time.
          </p>
        </Panel>
      </div>
    </TellerDesk>
  )
}
