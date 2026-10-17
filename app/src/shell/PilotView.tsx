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
        either trigger, and P2P money can’t be recalled.
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
        <b className="text-ink">What still helps:</b> an “I think I was scammed” path starts recovery
        sooner, and the pilot measures this gap. <Source ids={scam.map((e) => e.id).slice(0, 2)} />
      </p>
    </Card>
  )
}

const PILOT = [
  { icon: Gauge, when: 'Days 1-30', what: 'Shadow mode: triggers run silently. We count honest members who would have been paused.' },
  { icon: ShieldAlert, when: 'Days 31-90', what: 'Takeover mode on for everyone. Tricked mode at 2 branches and the wire desk.' },
  { icon: CalendarRange, when: 'Stop rule', what: 'If honest members are paused too often, raise thresholds before expanding.' },
]

const TARGETS = [
  ['Takeover-pattern P2P paused before send', '100%'],
  ['Honest holds released the same day', '90%+'],
  ['One-tap confirmations, pause to release', 'under 10 min'],
  ['Silent checks finished at the branch', '70%+'],
]

function Pilot() {
  return (
    <Card className="p-7">
      <Eyebrow>90-day pilot</Eyebrow>
      <h3 className="mt-2 font-display text-2xl">Shadow first, then switch on</h3>
      <ol className="mt-4 space-y-3">
        {PILOT.map(({ icon: Icon, when, what }) => (
          <li key={when} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon size={18} />
            </span>
            <div>
              <div className="text-sm font-semibold">{when}</div>
              <div className="text-sm text-ink-2">{what}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="text-xs font-semibold text-ink-3">
          Target assumptions (baselines measured in shadow mode)
        </div>
        <dl className="mt-2 space-y-1.5">
          {TARGETS.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 text-sm">
              <dt className="text-ink-2">{k}</dt>
              <dd className="num font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
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
