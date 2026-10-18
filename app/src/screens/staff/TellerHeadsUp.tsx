import { motion } from 'motion/react'
import { ArrowUpRight, Banknote, BellRing, MessageCircleQuestion, TabletSmartphone, type LucideIcon } from 'lucide-react'
import { HEADS_UP_WINDOW_HOURS } from '../../data/jamesRules'
import { clock, day } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { agentLine } from '../james/agent'
import { answerActions, ENDS, type TellerAction } from '../james/answers'
import { useJamesAnswers } from '../james/answersState'
import { COACHING_QUESTION, FOLLOW_UP } from '../james/copy'
import { daysAgo, JAMES_NAME, jamesFacts } from '../james/facts'
import { dollars } from '../linda/facts'
import { when } from './helpers'
import { ActionButton, FactRow, Panel, StatusPill, type ActionLook } from './parts'
import { TellerDesk } from './TellerDesk'

const ACTIONS: { id: TellerAction; label: string; hint: string; done: string; icon: LucideIcon }[] = [
  { id: 'ask', label: 'Ask the question', hint: 'Read it as written', done: 'Question asked', icon: MessageCircleQuestion },
  {
    id: 'tablet',
    label: 'Offer the private tablet check',
    hint: 'His taps stay private unless he shares them',
    done: 'Tablet check offered',
    icon: TabletSmartphone,
  },
  { id: 'escalate', label: 'Escalate to a specialist', hint: 'Someone joins you', done: 'Specialist on the way', icon: ArrowUpRight },
  {
    id: 'continue',
    label: `Continue: ${JAMES_NAME}'s decision`,
    hint: 'The withdrawal goes ahead',
    done: 'Withdrawal continued',
    icon: Banknote,
  },
]

/** Escalating and continuing each end the heads-up, so only one of them can be chosen. */
function lookOf(id: TellerAction, done: TellerAction[]): ActionLook {
  if (done.includes(id)) return 'done'
  if (ENDS.includes(id) && done.some((d) => ENDS.includes(d))) return 'off'
  return id === 'ask' ? 'recommended' : 'on'
}

function Pill({ done }: { done: TellerAction[] }) {
  if (done.includes('continue')) return <StatusPill tone="neutral">Withdrawal continued</StatusPill>
  if (done.includes('escalate')) return <StatusPill tone="brand">With a specialist</StatusPill>
  return (
    <StatusPill tone="warn" live>
      Heads-up · no hold
    </StatusPill>
  )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Step two: the heads-up beside the teller's own screen. Nothing is held; the buttons are the teller's. */
export function TellerHeadsUp() {
  const f = jamesFacts()
  const { call, cash } = f
  const { state, update } = useJamesAnswers()
  const done = state.teller
  return (
    <TellerDesk
      title="Teller line · heads-up"
      kind={`Cash withdrawal · ${day(cash.at)}`}
      caseId={state.agent ? `Case open since ${daysAgo(call.at, cash.at)}'s call` : undefined}
      pill={<Pill done={done} />}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-white p-5 ring-1 ring-amber-200"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">
          <BellRing size={13} aria-hidden /> Heads-up for the teller
        </div>
        <p className="mt-1.5 font-display text-[26px] leading-tight tracking-tight text-ink">
          {cap(daysAgo(call.at, cash.at))} at {clock(call.at)} {JAMES_NAME} called the contact center {f.topic}.
          Today: {dollars(cash.amount)} {cash.rail.toLowerCase()}.
        </p>
        {state.agent && (
          <p className="mt-1 text-[17px] leading-snug font-semibold text-ink">
            {cap(daysAgo(call.at, cash.at))}: {agentLine(state.agent)}.
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3">
          <span className="text-sm font-semibold text-ink">No hold. You and {JAMES_NAME} decide.</span>
          <Source ids={[call.id, cash.id]} />
        </div>
      </motion.div>
      <div className="grid items-start gap-4 @2xl:grid-cols-2">
        <Panel title="The withdrawal" icon={<Banknote size={14} />}>
          <div className="divide-y divide-line/70">
            <FactRow label="Amount">{dollars(cash.amount)} {cash.rail.toLowerCase()}</FactRow>
            <FactRow label="Started">
              <span className="font-mono">{clock(cash.at)}</span> · {cash.channel}
            </FactRow>
            <FactRow label="Size">
              <span className="text-danger">{f.ratio}x his 12-month 90th-percentile payment</span>
            </FactRow>
            <FactRow label="Call">{when(call, cash)} · {call.channel}</FactRow>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-3">
            <span className="font-semibold text-ink-2">Rule:</span> a cash or wire payment within{' '}
            {HEADS_UP_WINDOW_HOURS} hours of a contact center call. It reads that a call happened, never
            what was said.
          </p>
        </Panel>
        <Panel title="Ask first" icon={<MessageCircleQuestion size={14} />} delay={0.05}>
          <p className="font-display text-[22px] leading-snug text-ink">"{COACHING_QUESTION}"</p>
          <p className="mt-1.5 text-[17px] leading-snug text-ink-2">
            <span className="font-semibold text-ink">Then:</span> "{FOLLOW_UP}"
          </p>
          <p className="mt-2 text-xs text-ink-3">Ask it the same way, every time. Then let him answer.</p>
        </Panel>
      </div>
      <div className="grid gap-2.5 @2xl:grid-cols-2" role="group" aria-label="Teller actions">
        {ACTIONS.map((a) => (
          <ActionButton
            key={a.id}
            look={lookOf(a.id, done)}
            accent="warn"
            icon={<a.icon size={18} aria-hidden />}
            label={a.label}
            hint={a.hint}
            doneLabel={a.done}
            onClick={() => update((d) => answerActions.teller(d, a.id))}
          />
        ))}
      </div>
    </TellerDesk>
  )
}
