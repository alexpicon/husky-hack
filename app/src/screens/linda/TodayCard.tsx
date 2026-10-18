import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { clock, day } from '../../ui/format'
import { Card, Eyebrow, Source } from '../../ui/primitives'
import { Timeline, type TimelineItem } from '../../ui/timeline'
import { dollars, lindaFacts, shortDate } from './facts'

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function timelineItems(): TimelineItem[] {
  const f = lindaFacts()
  const amount = dollars(f.wire.amount)
  const secrecy = f.confirm.note.split('; ')[1] ?? f.confirm.note
  return [
    {
      time: clock(f.added.at),
      label: 'New wire recipient added',
      detail: `${f.minutesSinceAdded} minutes before the wire`,
      source: f.added.id,
    },
    {
      time: clock(f.wire.at),
      label: `Wire started: ${amount}`,
      detail: `First wire in ${f.yearsSinceLastWire} years · ${f.ratio}x her 12-month 90th-percentile payment`,
      tone: 'warn',
      source: f.wire.id,
    },
    {
      time: clock(f.confirm.at),
      label: 'Asked to confirm. She insists.',
      detail: `"${sentence(secrecy)}"`,
      tone: 'danger',
      source: f.confirm.id,
    },
    { time: clock(f.held.at), label: 'Sound holds the wire', tone: 'warn', source: f.held.id },
    {
      time: clock(f.offered.at),
      label: 'Trusted contact offered',
      detail:
        f.offered.memberResponse === 'Declined Offer' ? 'She declines' : f.offered.memberResponse,
      tone: 'brand',
      source: f.offered.id,
    },
    {
      time: clock(f.outreach.at),
      label: 'Sound calls her',
      detail:
        f.outreach.memberResponse === 'Confirmed Intended'
          ? 'She confirms she means it'
          : f.outreach.memberResponse,
      tone: 'brand',
      source: f.outreach.id,
    },
    {
      time: clock(f.released.at),
      label: `Wire released: ${amount} sent`,
      tone: 'danger',
      source: f.released.id,
    },
  ]
}

function Tried({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-1.5 rounded-full bg-brand-soft py-1 pr-3 pl-1 text-xs font-semibold text-brand ring-1 ring-indigo-200 ring-inset">
      <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
        <Check size={11} strokeWidth={3} aria-hidden />
      </span>
      {label}
    </li>
  )
}

export function TodayCard() {
  const f = lindaFacts()
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="w-[420px] overflow-hidden">
        <div className="p-6 pb-5">
          <div className="flex items-center justify-between">
            <Eyebrow>What happened today</Eyebrow>
            <span className="num font-mono text-xs text-ink-3">{day(f.wire.at)}</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="num font-display text-[52px] leading-none tracking-tight">
              {dollars(f.wire.amount)}
            </span>
            <span className="text-sm leading-snug text-ink-2">
              <span className="block font-semibold text-ink">
                {f.wire.rail} to a new account
              </span>
              At a {f.visit.channel.toLowerCase()}, {clock(f.visit.at)} <Source ids={f.visit.id} />
            </span>
          </div>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="What Sound tried today">
            <Tried label="Held it" />
            <Tried label="Offered trusted contact" />
            <Tried label="Called her" />
          </ul>
        </div>

        <div className="border-t border-line/80 px-6 py-5">
          <Timeline items={timelineItems()} compact />
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-line/80 bg-line/80">
          <div className="bg-danger-soft px-6 py-4">
            <div className="text-xs font-semibold text-danger">Lost for good</div>
            <div className="num mt-1 font-display text-[34px] leading-none text-danger">
              {dollars(f.lostForGood)}
            </div>
            <div className="mt-2 text-xs leading-snug text-ink-2">
              Recall failed {shortDate(f.recallFailed.at)} <Source ids={f.recallFailed.id} />
            </div>
          </div>
          <div className="bg-safe-soft px-6 py-4">
            <div className="text-xs font-semibold text-safe">Stopped the next day</div>
            <div className="num mt-1 font-display text-[34px] leading-none text-safe">
              {dollars(f.cash.amount)}
            </div>
            <div className="mt-2 text-xs leading-snug text-ink-2">
              Cash for 'bail', {shortDate(f.cashStopped.at)} <Source ids={f.cashStopped.id} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
