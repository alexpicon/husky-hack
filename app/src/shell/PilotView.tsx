import { CalendarRange, EyeOff, Gauge, ShieldAlert } from 'lucide-react'
import { eventsFor, keyFor } from '../data/kit'
import { firstHit, isTakeover, isTricked } from '../data/triggers'
import { money } from '../ui/format'
import { Badge, Card, Eyebrow, Source } from '../ui/primitives'
import { ResultsMatrix } from './ResultsMatrix'

function MichaelMiss() {
  const key = keyFor('M1002')
  const caught = firstHit('M1002', isTakeover) ?? firstHit('M1002', isTricked)
  if (caught) throw new Error('Michael is expected to be missed by both triggers')
  const scam = eventsFor('M1002').filter(
    (e) => e.type === 'Payment Initiated' && key.scamPaymentIds.includes(e.paymentId),
  )
  return (
    <Card className="p-7">
      <div className="flex items-center justify-between">
        <Eyebrow>The scam we miss, on purpose</Eyebrow>
        <Badge tone="danger">
          <EyeOff size={12} /> Not flagged
        </Badge>
      </div>
      <h3 className="mt-2 font-display text-2xl">Michael (M1002), a romance scam</h3>
      <p className="mt-2 text-sm text-ink-2">
        Small P2P payments grew for weeks, then turned into wires. No single payment looks like
        either trigger, so no rule fires.
      </p>
      <div className="mt-4 flex items-end gap-1.5" aria-label="Michael's scam payments over time">
        {scam.map((e) => (
          <div key={e.id} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-md ${e.rail === 'Wire' ? 'bg-rose-400' : 'bg-rose-200'}`}
              style={{ height: `${Math.max(6, (e.amount / 4000) * 88)}px` }}
              title={`${e.rail} ${money(e.amount)} (${e.id})`}
            />
            <span className="num font-mono text-[10px] text-ink-3">{e.rail === 'Wire' ? 'wire' : 'P2P'}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-baseline justify-between text-sm">
        <span className="text-ink-2">Lost in the kit</span>
        <span className="num font-semibold text-danger">{money(key.netLoss)}</span>
      </div>
      <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-ink-2">
        <b className="text-ink">What still helps:</b> an “I think I’ve been scammed” path starts recovery
        sooner, and the pilot measures this gap. <Source ids={scam.map((e) => e.id).slice(0, 2)} />
      </p>
    </Card>
  )
}

const PILOT = [
  {
    icon: Gauge,
    when: 'Days 1-30: shadow month',
    what: 'The rules run silently. We count the honest members who would have been paused. To go live: triggered test cases paused before send (integration tests), 100%.',
  },
  {
    icon: ShieldAlert,
    when: 'Days 31-90: a small group',
    what: 'Live at 2 branches, the wire desk and a small opted-in digital group. Expand only if honest-member delays and complaints stay within targets.',
  },
  {
    icon: CalendarRange,
    when: 'Stop rule',
    what: 'If honest members are paused too often, review the rule, staffing and group before expanding. Raising amount thresholds alone reopens the small-scam gap.',
  },
]

/** Planning assumptions, named after the starter kit's suggested success measures. */
const MEASURES = [
  {
    name: 'Dollars of harm prevented',
    counts: 'scam dollars that never leave',
    today: 'Unknown: the shadow month measures it',
    target: 'Set from the shadow month, not invented',
  },
  {
    name: 'False-positive rate',
    counts: 'honest payments given an extra review',
    today: '3 in 100',
    target: '1 in 100 or fewer',
  },
  {
    name: 'Time from hold to release for legitimate members',
    counts: 'median / slowest 5%',
    today: '2 h / 4 h',
    target: '15 min / 1 h, in service hours',
  },
  {
    name: 'Employee effort',
    counts: 'staff time per resolved case',
    today: '15 min',
    target: '8 min or less',
  },
  {
    name: 'After-hours holds waiting for review',
    counts: 'held past 4 hours',
    today: 'Some wait for the next morning',
    target: 'None: an unreviewed payment is not sent',
  },
]

function Measures() {
  return (
    <table className="mt-5 w-full text-left text-sm">
      <caption className="mb-2 text-left text-[11px] font-semibold tracking-[0.14em] text-warn uppercase">
        Assumptions, not Sound data
      </caption>
      <thead>
        <tr className="text-xs text-ink-3">
          <th scope="col" className="pb-2 font-medium">Measure</th>
          <th scope="col" className="pb-2 pl-3 font-medium">Assumed today</th>
          <th scope="col" className="pb-2 pl-3 font-medium">Pilot target</th>
        </tr>
      </thead>
      <tbody>
        {MEASURES.map((m) => (
          <tr key={m.name} className="border-t border-line align-top">
            <th scope="row" className="py-2.5 pr-3 font-normal">
              <span className="block font-semibold text-ink">{m.name}</span>
              <span className="block text-xs text-ink-3">{m.counts}</span>
            </th>
            <td className="num py-2.5 pl-3 text-ink-2">{m.today}</td>
            <td className="num py-2.5 pl-3 font-semibold text-ink">{m.target}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Pilot() {
  return (
    <Card className="p-7">
      <Eyebrow>90-day pilot</Eyebrow>
      <h3 className="mt-2 font-display text-2xl">Shadow first, then a small group</h3>
      <ol className="mt-4 space-y-3">
        {PILOT.map(({ icon: Icon, when, what }) => (
          <li key={when} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon size={18} aria-hidden />
            </span>
            <div>
              <div className="text-sm font-semibold">{when}</div>
              <div className="text-sm text-ink-2">{what}</div>
            </div>
          </li>
        ))}
      </ol>
      <Measures />
    </Card>
  )
}

export function PilotView() {
  return (
    <div>
      <Eyebrow>Design check and pilot</Eyebrow>
      <h1 className="mt-2 font-display text-[44px] leading-[1.05] tracking-tight">
        Tested on the organizers’ data. Honest about the miss.
      </h1>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <ResultsMatrix />
        <div className="flex flex-col gap-6">
          <MichaelMiss />
          <Pilot />
        </div>
      </div>
    </div>
  )
}
