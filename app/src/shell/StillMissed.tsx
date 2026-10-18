import { Banknote, HeartCrack, Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import { money } from '../ui/format'
import { Badge, Card, Eyebrow, Source } from '../ui/primitives'
import { familyUnder, followUpHolds, michael, scamCash } from './designCheck'

function Miss({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">{icon}</span>
      <div className="min-w-0 flex-1">
        <b className="block text-ink">{title}</b>
        {children}
      </div>
    </li>
  )
}

/** Michael's scam payments in order: rose for what was gone before the card, grey for his own call after it. */
function MichaelBars() {
  const { payments, card, held } = michael()
  const tallest = Math.max(...payments.map((e) => e.amount))
  const mark = (id: string) => (id === card.id ? 'card' : held.some((e) => e.id === id) ? 'held' : '')
  return (
    <div className="mt-3 flex items-end gap-1.5" aria-label="Michael's scam payments over time">
      {payments.map((e) => (
        <div key={e.id} className="flex flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[10px] font-semibold text-ink-2">{mark(e.id)}</span>
          <div
            className={`w-full rounded-md ${e.at < card.at ? 'bg-rose-400' : 'bg-slate-300'}`}
            style={{ height: `${Math.max(6, (e.amount / tallest) * 72)}px` }}
            title={`${e.rail} ${money(e.amount)} (${e.id})`}
          />
          <span className="num font-mono text-[10px] text-ink-3">{e.rail === 'Wire' ? 'wire' : 'P2P'}</span>
        </div>
      ))}
    </div>
  )
}

/** The scams Second Look catches late, misses under a threshold, or leaves to the member's choice. */
export function StillMissed() {
  const m = michael()
  const holds = followUpHolds()
  const family = familyUnder()
  const cash = scamCash()
  return (
    <Card className="p-7">
      <div className="flex items-center justify-between">
        <Eyebrow>What we still miss</Eyebrow>
        <Badge tone="danger">Named on purpose</Badge>
      </div>
      <h3 className="mt-2 font-display text-2xl">Late, under the line, or the member’s call</h3>
      <ul className="mt-5 space-y-5 text-sm text-ink-2">
        <Miss
          icon={<HeartCrack size={18} aria-hidden />}
          title="Michael (M1002), a relationship investment scam, caught late"
        >
          His first <span className="num">{money(m.gone)}</span> is gone before the card: it shows on his{' '}
          {m.run}th growing payment (<span className="num">{money(m.card.amount)}</span>), and every
          wire after it to his platform account is held for a call:{' '}
          {m.held.map((e, i) => (
            <span key={e.id}>
              {i > 0 && (i === m.held.length - 1 ? ' and ' : ', ')}
              <span className="num">{money(e.amount)}</span>
            </span>
          ))}
          . The card is advice; he decides. In the kit he lost <span className="num">{money(m.lost)}</span>.{' '}
          <Source ids={[m.card.id, ...m.held.map((e) => e.id)]} />
          <span className="mt-2 block">
            The hold reaches{' '}
            <span className="num">
              {holds.scamHeld === holds.scamMoves ? 'all' : `${holds.scamHeld} of`} {holds.scamMoves}
            </span>{' '}
            romance scam wires and transfers ({holds.journeysHeld} of {holds.journeys} journeys) and{' '}
            <span className="num">
              {holds.honestHeld} of {holds.honest}
            </span>{' '}
            honest members.
          </span>
          <MichaelBars />
        </Miss>
        {family.wires.length > 0 && (
          <Miss
            icon={<Scale size={18} aria-hidden />}
            title={`${family.wires.length} family emergencies under ${family.ratio}x`}
          >
            {family.wires.map((w, i) => (
              <span key={w.id}>
                {i > 0 && (i === family.wires.length - 1 ? ' and ' : ', ')}
                {w.member} wired <span className="num">{money(w.amount)}</span> at{' '}
                <span className="num">{w.baselineRatio}x</span>
              </span>
            ))}{' '}
            their 12-month 90th-percentile payment, under the line, so Linda’s rule leaves them alone.{' '}
            <Source ids={family.wires.map((w) => w.id)} />
          </Miss>
        )}
        <Miss icon={<Banknote size={18} aria-hidden />} title="Cash a member still insists on">
          {cash.holds
            ? 'A Second Look hold covers some cash; the teller still decides.'
            : 'James’s heads-up is not a hold: the teller decides, and a member who insists can still take the cash.'}
        </Miss>
      </ul>
    </Card>
  )
}
