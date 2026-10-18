import { motion } from 'motion/react'
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  FlaskConical,
  Headset,
  Link2,
  MessageCircleQuestion,
  type LucideIcon,
} from 'lucide-react'
import { HEADS_UP_WINDOW_HOURS } from '../../data/jamesRules'
import { clock, day } from '../../ui/format'
import { Source } from '../../ui/primitives'
import {
  AGENT_CHOICES,
  AGENT_QUESTION,
  CALL_REASON,
  COACHED_FIRST,
  PILOT_LABEL,
  type AgentChoice,
} from '../james/agent'
import { answerActions } from '../james/answers'
import { useJamesAnswers } from '../james/answersState'
import { JAMES_NAME, jamesFacts } from '../james/facts'
import { ActionButton, Panel, StatusPill, type ActionLook } from './parts'
import { TellerDesk } from './TellerDesk'

const ICONS: Record<AgentChoice, LucideIcon> = { clear: CircleCheck, hesitated: CircleAlert, transfer: ArrowUpRight }

/** One choice per call: once logged, the others are off. */
const lookOf = (id: AgentChoice, chosen: AgentChoice | null): ActionLook =>
  chosen === null ? 'on' : chosen === id ? 'done' : 'off'

/**
 * Step one, as a pilot would run it: the agent's live-call screen asks one question from the
 * call's reason code. The kit's own call record stays in the member pane.
 */
export function CallCenter() {
  const { call } = jamesFacts()
  const { state, update } = useJamesAnswers()
  const chosen = state.agent
  const logged = AGENT_CHOICES.find((c) => c.id === chosen)
  return (
    <TellerDesk
      title="Contact center · live call"
      kind={`Live call · ${day(call.at)} · ${clock(call.at)}`}
      caseId={logged ? 'Case open · call logged' : 'Not logged yet'}
      pill={
        logged ? (
          <StatusPill tone="brand">Logged: {logged.result}</StatusPill>
        ) : (
          <StatusPill tone="warn" live>
            Live call · no hold
          </StatusPill>
        )
      }
    >
      <p className="flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-brand-soft px-3.5 py-2 text-sm font-semibold text-brand">
        <FlaskConical size={16} className="shrink-0" aria-hidden />
        {PILOT_LABEL}
      </p>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-white p-5 ring-1 ring-amber-200"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">
          <Headset size={13} aria-hidden /> On the call now
        </div>
        <p className="mt-1.5 font-display text-[26px] leading-tight tracking-tight text-ink">
          Call reason: {CALL_REASON}
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3">
          <span className="text-[15px] font-semibold text-ink">{COACHED_FIRST}</span>
          <Source ids={call.id} />
        </div>
      </motion.div>
      <Panel title="Ask on the call" icon={<MessageCircleQuestion size={14} />} delay={0.05}>
        <p className="font-display text-[22px] leading-snug text-ink">Ask: "{AGENT_QUESTION}"</p>
        <p className="mt-2 text-xs text-ink-3">Ask it the same way, every time. Then let him answer.</p>
      </Panel>
      <div className="grid gap-2.5 @2xl:grid-cols-3" role="group" aria-label="Agent actions">
        {AGENT_CHOICES.map((c) => {
          const Icon = ICONS[c.id]
          return (
            <ActionButton
              key={c.id}
              look={lookOf(c.id, chosen)}
              accent="warn"
              icon={<Icon size={18} aria-hidden />}
              label={c.label}
              hint={c.hint}
              doneLabel={`Logged: ${c.result}`}
              onClick={() => update((a) => answerActions.agent(a, c.id))}
            />
          )
        })}
      </div>
      <p className="text-sm font-semibold text-ink">No hold. Logged on {JAMES_NAME}'s case.</p>
      <Panel title="What Sound already keeps" icon={<Link2 size={14} />} delay={0.1}>
        <p className="text-sm leading-relaxed text-ink-2">
          The call record exists today. For the next {HEADS_UP_WINDOW_HOURS} hours, a cash or wire
          payment {JAMES_NAME} starts puts a heads-up in front of the teller. That rule reads that a
          call happened, never what was said.
        </p>
      </Panel>
    </TellerDesk>
  )
}
