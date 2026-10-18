import { CalendarRange, Gauge, ShieldAlert } from 'lucide-react'
import { Card, Eyebrow } from '../ui/primitives'
import { FamilySplit, LeftAlone, MinuteZero } from './DesignLines'
import { NameAnyMember } from './NameAnyMember'
import { ResultsMatrix } from './ResultsMatrix'
import { StillMissed } from './StillMissed'

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
    <table className="mt-5 w-full text-left text-sm xl:mt-0">
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
    <Card className="grid grid-cols-1 gap-x-10 p-7 xl:grid-cols-[1fr_1.35fr]">
      <div>
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
      </div>
      <Measures />
    </Card>
  )
}

export function PilotView() {
  return (
    <div>
      <Eyebrow>Design check and pilot</Eyebrow>
      <h1 className="mt-2 font-display text-[44px] leading-[1.05] tracking-tight">
        Tested on the organizers’ data. Honest about the misses.
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-6">
        <ResultsMatrix />
        <NameAnyMember />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <MinuteZero />
          <FamilySplit />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StillMissed />
          <LeftAlone />
        </div>
        <Pilot />
      </div>
    </div>
  )
}
