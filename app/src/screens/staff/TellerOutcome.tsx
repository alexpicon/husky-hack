import { History, Scale } from 'lucide-react'
import { clock, day } from '../../ui/format'
import { Timeline, type TimelineItem } from '../../ui/timeline'
import { agentLine, type AgentChoice } from '../james/agent'
import { handedOver, type TellerAction } from '../james/answers'
import { useJamesAnswers } from '../james/answersState'
import { COACHING_QUESTION, QUESTION } from '../james/copy'
import { JAMES_NAME, jamesFacts } from '../james/facts'
import { answer } from '../james/outcome'
import { dollars } from '../linda/facts'
import { plural } from './helpers'
import { Panel, StatusPill } from './parts'
import { TellerDesk } from './TellerDesk'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The day before, from another department: the call the heads-up linked to this case, and the agent's choice if one was logged. */
function linkedCall(agent: AgentChoice | null): TimelineItem {
  const f = jamesFacts()
  return {
    time: clock(f.call.at),
    label: 'Contact center call · linked to this case',
    detail: `${cap(f.topic)}.${agent ? ` ${cap(agentLine(agent))}.` : ''}`,
    tone: 'brand',
    source: f.call.id,
  }
}

function Day({ at, channel }: { at: Date; channel: string }) {
  return (
    <p className="mb-2 text-xs font-semibold text-ink-2">
      {day(at)} · {channel}
    </p>
  )
}

function started(): TimelineItem {
  const f = jamesFacts()
  return {
    time: clock(f.cash.at),
    label: `Cash withdrawal started: ${dollars(f.cash.amount)}`,
    detail: 'Heads-up on the teller screen',
    tone: 'warn',
    source: f.cash.id,
  }
}

/** The kit's afternoon: he asks for help and cancels. */
function cancelledItems(): TimelineItem[] {
  const f = jamesFacts()
  const amount = dollars(f.cash.amount)
  return [
    started(),
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

/** The teller went on with it, so the kit has no rows past the withdrawal and none are cited. */
function handedOverItems(done: TellerAction[]): TimelineItem[] {
  const f = jamesFacts()
  const steps: TimelineItem[] = [started()]
  if (done.includes('ask')) steps.push({ time: '', label: 'Teller asks the question', detail: `"${COACHING_QUESTION}"`, tone: 'brand' })
  if (done.includes('tablet')) steps.push({ time: '', label: 'Private tablet check offered', tone: 'brand' })
  steps.push(
    {
      time: '',
      label: `Withdrawal continued at ${JAMES_NAME}'s decision`,
      detail: `${dollars(f.cash.amount)} handed over in cash. Cash can't be recalled.`,
      tone: 'danger',
    },
    { time: '', label: 'Case opened', detail: `${f.caseId} · ${JAMES_NAME} can report it any time` },
  )
  return steps
}

/** Step three: one case across departments, ending as the teller chose at step two, and what the heads-up changes for every other teller. */
export function TellerOutcome() {
  const f = jamesFacts()
  const out = f.unasked
  const { state } = useJamesAnswers()
  const over = handedOver(state)
  return (
    <TellerDesk
      title={`One case · ${f.caseId}`}
      kind={`Contact center and branch · ${day(f.call.at)} to ${day(f.cash.at)}`}
      caseId={f.caseId}
      pill={over ? <StatusPill tone="danger">Cash handed over</StatusPill> : <StatusPill tone="safe">Withdrawal cancelled</StatusPill>}
    >
      <div className="grid items-start gap-4 @2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel title="One case across departments" icon={<History size={14} />}>
          <Day at={f.call.at} channel={f.call.channel} />
          <Timeline items={[linkedCall(state.agent)]} compact />
          <div className="mt-4">
            <Day at={f.cash.at} channel={f.cash.channel} />
            <Timeline items={over ? handedOverItems(state.teller) : cancelledItems()} compact />
          </div>
        </Panel>
        <Panel title="The kit, side by side" icon={<Scale size={14} />} delay={0.05}>
          <p className="text-[15px] leading-relaxed text-ink-2">
            <span className="font-semibold text-ink">In the kit, without Second Look:</span> one teller
            happened to ask {JAMES_NAME}, and the {dollars(f.cash.amount)} stayed with him.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            In the kit, {plural(out.payments.length, 'other')} in this scam{' '}
            {out.payments.length === 1 ? "wasn't" : "weren't"} asked:{' '}
            <span className="font-semibold text-danger">{dollars(out.total)}</span> left the branch.
          </p>
          <p className="mt-3 rounded-xl bg-warn-soft px-3.5 py-3 text-[15px] leading-snug font-semibold text-ink ring-1 ring-amber-200 ring-inset">
            The heads-up makes the question happen every time.
          </p>
        </Panel>
      </div>
    </TellerDesk>
  )
}
