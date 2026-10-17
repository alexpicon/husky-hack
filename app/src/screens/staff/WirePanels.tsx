import { Banknote, Hourglass } from 'lucide-react'
import { TRICKED_RAIL_GAP_DAYS, TRICKED_RATIO } from '../../data/triggers'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { plural } from './helpers'
import { FactRow, Panel, StatusPill } from './parts'
import { HOLD_HOURS, type TrickedFacts } from './trickedFacts'

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
          <span className="text-danger">{f.ratio}x her usual</span>
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
        <span className="font-semibold text-ink-2">Rule:</span> a wire or cash payment at least{' '}
        {TRICKED_RATIO}x the member's usual, to a new recipient or the first on that rail in{' '}
        {TRICKED_RAIL_GAP_DAYS}+ days.
      </p>
    </Panel>
  )
}

export function HoldPanel({ f }: { f: TrickedFacts }) {
  return (
    <Panel
      title="Hold"
      icon={<Hourglass size={14} />}
      delay={0.05}
      aside={
        <StatusPill tone="warn" live>
          On hold
        </StatusPill>
      }
    >
      <div className="flex items-baseline justify-between text-sm">
        <span>
          <span className="block text-xs text-ink-3">Held from</span>
          <span className="num font-mono font-semibold text-ink">{clock(f.hit.at)}</span>
        </span>
        <span className="text-right">
          <span className="block text-xs text-ink-3">Hold window ends</span>
          <span className="num font-mono font-semibold text-warn">{clock(f.holdEnds)}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100" aria-hidden>
        <div className="h-full w-[6%] rounded-full bg-amber-500" />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Sound can hold a wire for up to {plural(HOLD_HOURS, 'hour')} while it checks with the
        member. <Source ids={f.hit.id} />
      </p>
    </Panel>
  )
}
