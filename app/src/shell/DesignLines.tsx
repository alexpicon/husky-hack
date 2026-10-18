import { Banknote, House } from 'lucide-react'
import type { GroupResult } from '../data/triggers'
import { money } from '../ui/format'
import { Card, Eyebrow, Source } from '../ui/primitives'
import {
  closingWire,
  columns,
  dollars,
  FAMILY,
  familySplit,
  HOME_BUYER,
  minuteZero,
  scamCash,
  type Asked,
  type TakeoverClock,
} from './designCheck'

/** One chart row: a label column, then the minute track. */
const ROW = 'grid grid-cols-[104px_1fr] gap-3 sm:grid-cols-[150px_1fr]'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

type StripProps = { label: string; clocks: TakeoverClock[]; max: number; dot: string; note: string }

function Strip({ label, clocks, max, dot, note }: StripProps) {
  const at = (m: number) => `${(m / max) * 100}%`
  const minutes = clocks.map((c) => c.minutes)
  const from = Math.min(...minutes)
  const to = Math.max(...minutes)
  const seen = new Map<number, number>()
  const count = (m: number) => minutes.filter((x) => x === m).length
  return (
    <div className={`${ROW} items-center`}>
      <div className="text-xs leading-tight font-semibold text-ink-2">
        {label}
        <span className="block font-normal text-ink-3">{note}</span>
      </div>
      <div className="relative h-9">
        <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
        <div
          className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full bg-slate-100"
          style={{ left: `calc(${at(from)} - 8px)`, width: `calc(${at(to - from)} + 16px)` }}
        />
        {clocks.map((c) => {
          const stack = seen.get(c.minutes) ?? 0
          seen.set(c.minutes, stack + 1)
          const offset = (stack - (count(c.minutes) - 1) / 2) * 10
          return (
            <span
              key={c.member}
              className={`absolute size-2.5 -translate-x-1/2 rounded-full ring-2 ring-white ${dot}`}
              style={{ left: at(c.minutes), top: `calc(50% - 5px + ${offset}px)` }}
              title={`${c.member}: ${c.minutes} min`}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Sound's own hold-and-text step in the kit, timed against the money leaving. */
export function MinuteZero() {
  const { reached, missed } = minuteZero()
  const max = Math.ceil((Math.max(reached.to, missed.to) + 1) / 5) * 5
  const ticks = Array.from({ length: max / 5 + 1 }, (_, i) => i * 5)
  const all = reached.saved === reached.count
  const saved = all ? 'saved every takeover it reached' : `saved ${reached.saved} of the takeovers it reached`
  const summary = `Minutes after the first scam payment started: Sound's hold landed at ${reached.from} to ${reached.to}; without it the money was gone at ${missed.from} to ${missed.to}; Second Look acts at 0.`
  return (
    <Card className="p-7">
      <Eyebrow>Takeovers · Sound’s own step</Eyebrow>
      <h3 className="mt-2 font-display text-2xl">Moved to minute zero</h3>
      <p className="mt-2 text-sm text-ink-2">
        In the kit, Sound’s hold-and-text step {saved} (
        <span className="num">
          {reached.saved} of {reached.count}, {dollars(reached.lost)} lost
        </span>
        ) and landed {reached.from} to {reached.to} minutes after the payment started. Where it never
        came, the money was gone {missed.from} to {missed.to} minutes after the start.{' '}
        <b className="text-ink">Second Look moves that step to the moment the payment starts.</b>
      </p>
      <div className="mt-5 space-y-1" role="img" aria-label={summary}>
        <div className={`${ROW} items-center`}>
          <div className="text-xs leading-tight font-semibold text-brand">
            Second Look
            <span className="block font-normal text-ink-3">hold and text at once</span>
          </div>
          <div className="relative h-9">
            <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
            <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-full bg-brand" />
          </div>
        </div>
        <Strip
          label="Sound’s hold landed"
          clocks={reached.takeovers}
          max={max}
          dot="bg-teal-500"
          note={`${reached.count} takeovers · ${dollars(reached.lost)} lost`}
        />
        <Strip
          label="Money gone, no hold"
          clocks={missed.takeovers}
          max={max}
          dot="bg-rose-500"
          note={`${missed.count} takeovers · ${dollars(missed.lost)} lost`}
        />
        <div className={`${ROW} pt-1`}>
          <span />
          <div>
            <div className="relative h-4 font-mono text-[10px] text-ink-3">
              {ticks.map((t) => (
                <span key={t} className="num absolute -translate-x-1/2" style={{ left: `${(t / max) * 100}%` }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-ink-3">minutes after the first scam payment started</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

const SPLIT: Record<Asked, { square: string; label: (n: number) => string }> = {
  'not asked': { square: 'bg-rose-400', label: (n) => `${n} with no hold or question` },
  'coached yes': { square: 'bg-amber-400', label: (n) => `${n} who gave a coached yes` },
  'asked for help': { square: 'bg-teal-500', label: (n) => `the ${n} who asked for help` },
}

const share = (r: GroupResult) => (r.flagged === r.total ? `all ${r.total}` : `${r.flagged} of these ${r.total}`)

/** The kit's family-emergency journeys, by whether Sound asked and what the member said. */
export function FamilySplit() {
  const split = familySplit()
  const total = split.reduce((n, s) => n + s.members.length, 0)
  const asked = split.filter((s) => s.kind !== 'not asked')
  const coached = split.find((s) => s.kind === 'coached yes')?.members.length ?? 0
  const paused = columns().linda.find((r) => r.group === FAMILY)
  return (
    <Card className="p-7">
      <Eyebrow>Family emergencies · how the kit’s {total} ended</Eyebrow>
      <h3 className="mt-2 font-display text-2xl">Linda’s family-emergency split</h3>
      <div className="mt-4 flex gap-0.5" aria-hidden>
        {split.flatMap((s) =>
          s.members.map((m) => (
            <span key={m} className={`h-6 flex-1 rounded ${SPLIT[s.kind].square}`} title={m} />
          )),
        )}
      </div>
      <ul className="mt-4 divide-y divide-line">
        {split.map((s) => (
          <li key={s.kind} className="flex items-center gap-3 py-2 text-sm">
            <span className={`size-3 shrink-0 rounded-sm ${SPLIT[s.kind].square}`} aria-hidden />
            <span className="flex-1 text-ink-2">{SPLIT[s.kind].label(s.members.length)}</span>{' '}
            <span className="num font-semibold text-ink">lost {dollars(s.lost)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink-2">
        Of the <span className="num">{asked.reduce((n, s) => n + s.members.length, 0)}</span> asked,{' '}
        <span className="num">{coached}</span> gave a coached yes. So Linda’s check is silent: a true fact
        and taps on a screen, not a question out loud.
        {paused && (
          <>
            {' '}
            Linda’s rule pauses{' '}
            <span className="num">{share(paused)}</span>.
          </>
        )}
      </p>
    </Card>
  )
}

/** What Second Look leaves to Sound's people: honest closing wires and cash at the branch. */
export function LeftAlone() {
  const { wire, review, secondLookHolds } = closingWire()
  const cash = scamCash()
  const reach =
    cash.headsUp === cash.government ? `all ${cash.government}` : `${cash.headsUp} of the ${cash.government}`
  const age = wire.recipientAgeDays ?? 0
  return (
    <Card className="p-7">
      <Eyebrow>Left to Sound’s people</Eyebrow>
      <h3 className="mt-2 font-display text-2xl">Sound’s wire desk and tellers still decide</h3>
      <ul className="mt-5 space-y-5 text-sm text-ink-2">
        <li className="flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-safe-soft text-safe">
            <House size={18} aria-hidden />
          </span>
          <p>
            <b className="block text-ink">An honest home closing</b>
            {secondLookHolds ? 'Second Look also holds' : 'Second Look adds no hold to'} {HOME_BUYER}’s{' '}
            <span className="num">{money(wire.amount)}</span> home-closing wire (payee added{' '}
            {plural(age, 'day')} earlier); Sound’s existing wire review is unchanged.{' '}
            <Source ids={[wire.id, review.id]} />
          </p>
        </li>
        <li className="flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warn-soft text-warn">
            <Banknote size={18} aria-hidden />
          </span>
          <p>
            <b className="block text-ink">Cash at the branch</b>
            Cash stays with the teller. James’s heads-up reaches the teller on {reach} government
            impersonation cash requests. In the kit, without it, {cash.stopped.count} of {cash.total} scam
            withdrawals were stopped at the branch ({dollars(cash.stopped.amount)}) and{' '}
            {dollars(cash.out.amount)} still went out.
          </p>
        </li>
      </ul>
    </Card>
  )
}
