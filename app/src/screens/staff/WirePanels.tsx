import { Banknote, Clock, Hourglass } from 'lucide-react'
import { TRICKED_SAME_DAY } from '../../data/trickedRules'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { caseActions, useLindaCase } from '../linda/lindaCase'
import { plural } from './helpers'
import { FactRow, Panel, StatusPill } from './parts'
import { HOLD_HOURS, wireRuleText, type TrickedFacts } from './trickedFacts'

export function WireFacts({ f }: { f: TrickedFacts }) {
  const { hit, recipientAdded } = f
  return (
    <Panel title="The wire" icon={<Banknote size={14} />}>
      <div className="num font-display text-[44px] leading-none tracking-tight text-ink">{money(hit.amount)}</div>
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-3">
        <span className="font-mono">{hit.paymentId}</span>
        <Source ids={hit.id} />
      </div>
      <div className="mt-3 divide-y divide-line/70 border-t border-line/70">
        <FactRow label="Rail">{hit.rail}</FactRow>
        <FactRow label="Started">
          <span className="font-mono">{clock(hit.at)}</span> · {hit.channel}
        </FactRow>
        <FactRow label="Size">
          <span className="text-danger">{f.ratio}x her 12-month 90th-percentile payment</span>
          {TRICKED_SAME_DAY && (
            <span className="block text-xs text-ink-3">today's wires to this recipient, together</span>
          )}
        </FactRow>
        <FactRow label="Last wire">
          <span className="text-danger">{plural(f.yearsSinceSameRail, 'year')} ago</span>{' '}
          <span className="text-ink-3">({f.daysSinceSameRail.toLocaleString('en-US')} days)</span>
        </FactRow>
        <FactRow label="To">
          <span className="font-mono">{hit.recipientId}</span>{' '}
          <span className="text-danger">new, added {clock(recipientAdded.at)}</span>{' '}
          <Source ids={recipientAdded.id} />
        </FactRow>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        <span className="font-semibold text-ink-2">Rule:</span> {wireRuleText()}
      </p>
    </Panel>
  )
}

const holdStatus = {
  cancelled: 'Cancelled',
  sent: 'Released',
  help: 'With a specialist',
  'no-response': 'Not sent',
} as const

export function HoldPanel({ f, now }: { f: TrickedFacts; now: Date }) {
  const { state, update } = useLindaCase()
  const done = state.outcome
  const until = clock(f.holdEnds)
  const stoppedAt = done && done.kind !== 'help' ? new Date(done.at) : now
  const span = f.holdEnds.getTime() - f.hit.at.getTime()
  const used = Math.min(1, Math.max(0, (stoppedAt.getTime() - f.hit.at.getTime()) / span))
  return (
    <Panel
      title="Hold"
      icon={<Hourglass size={14} />}
      delay={0.05}
      aside={
        done ? (
          <StatusPill tone="neutral">{holdStatus[done.kind]}</StatusPill>
        ) : (
          <StatusPill tone="warn" live>
            On hold
          </StatusPill>
        )
      }
    >
      <div className="flex items-baseline justify-between text-sm">
        <span>
          <span className="block text-xs text-ink-3">Held from</span>
          <span className="num font-mono font-semibold text-ink">{clock(f.hit.at)}</span>
        </span>
        <span className="text-right">
          <span className="block text-xs text-ink-3">Deadline</span>
          <span className="num font-mono font-semibold text-warn">{until}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100" aria-hidden>
        <div
          className="h-full rounded-full bg-amber-500"
          style={{ width: `${Math.max(2, used * 100)}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Sound can hold a wire for up to {plural(HOLD_HOURS, 'hour')} while it checks with the
        member. If no one reaches her by {until}, the wire is not sent and the money stays in her
        account. <Source ids={f.hit.id} />
      </p>
      {state.staffActions.includes('holding') && !done && (
        <button
          type="button"
          onClick={() => update((c) => caseActions.decide(c, 'no-response', f.holdEnds))}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-ink-2 ring-1 ring-line ring-inset transition hover:bg-slate-50"
        >
          <Clock size={15} aria-hidden /> No answer by {until}: don't send
        </button>
      )}
    </Panel>
  )
}
