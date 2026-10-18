import { Eye } from 'lucide-react'
import { POLICY } from '../data/policy'
import { TRICKED_RULES } from '../data/trickedRules'
import { Badge, Source, toneDot } from '../ui/primitives'
import { replay } from './memberReplay'
import { ReplayTimeline } from './ReplayTimeline'
import { when } from './replayRules'

const linda = TRICKED_RULES[POLICY.lindaRule]
const policyLine = `Rules as policy.ts sets them: Linda’s rule at ${linda.ratio}x ${linda.sameDay ? 'per day to one payee' : 'per wire'}; the 2-hour session rule ${POLICY.sessionRule ? 'on' : 'off'}.`

/** What the rules saw: the member's events, and each rule that fired, judged on events up to then. */
export function ReplaySaw({ member }: { member: string }) {
  const { events, hits } = replay(member)
  return (
    <section className="rounded-2xl p-5 ring-1 ring-line" aria-labelledby="replay-saw">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 id="replay-saw" className="flex items-center gap-2 font-semibold text-ink">
          <Eye size={16} aria-hidden className="text-brand" />
          What the rules saw (events up to that moment)
        </h4>
        <Badge tone="brand">Kit events only</Badge>
      </div>
      <p className="mt-1 text-xs text-ink-3">
        Each rule judges an event using only {member}’s events stamped at or before it. {policyLine} Event
        notes are free text no rule reads, so they are left out.
      </p>
      {hits.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-ink">
          No rule fired for this member.
          <span className="block font-normal text-ink-2">
            That is what the rules saw in <span className="num">{events.length}</span> events, not a finding
            about what happened.
          </span>
        </p>
      ) : (
        <ol className="mt-4 space-y-3" aria-label="Rules that fired, in time order">
          {hits.map((h) => (
            <li key={`${h.rule.key}-${h.event.id}`} className="flex gap-3 text-sm">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${toneDot[h.rule.tone]}`} aria-hidden />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <b className="text-ink">{h.rule.label}</b>
                  <span className="num font-mono text-xs text-ink-2">{when(h.event.at)}</span>
                  <Source ids={h.event.id} />
                </div>
                <div className="text-ink-2">{h.fact}</div>
                <div className="text-xs text-ink-3">
                  Read <span className="num">{h.seen}</span> of {events.length} events, up to this moment.
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <ReplayTimeline events={events} hits={hits} />
    </section>
  )
}
