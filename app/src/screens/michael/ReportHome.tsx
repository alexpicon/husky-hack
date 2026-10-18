import { ShieldAlert } from 'lucide-react'
import type { KitEvent } from '../../data/kit'
import { money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { Source } from '../../ui/primitives'
import { SOUND, SoundAppScreen, SoundCard } from '../../ui/soundApp'
import { shortDate } from '../linda/facts'
import { AppBar } from '../m1039/parts'
import { michaelFacts } from './facts'

/** His payments to the two payees, newest first: what he sees on the day he reports. */
function recentPayments(): KitEvent[] {
  const f = michaelFacts()
  return [...f.run, ...f.wires].filter((e) => e.at <= f.reported.at).reverse()
}

function Row({ e }: { e: KitEvent }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-black/[0.07] py-2 last:border-0">
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">
          To {e.recipientId}
        </span>
        <span className="text-[13px] opacity-70">
          {shortDate(e.at)} · {e.rail}
        </span>{' '}
        <Source ids={e.id} />
      </span>
      <span className="num shrink-0 text-[15px] font-semibold">-{money(e.amount)}</span>
    </li>
  )
}

function Hint() {
  return (
    <p className="flex items-start gap-2 px-1 text-[13px] leading-snug opacity-80">
      <ShieldAlert size={15} className="mt-px shrink-0" aria-hidden />
      "I think I've been scammed" is at the top of every screen. One tap opens a case.
    </p>
  )
}

/** The day he reports: his recent payments, with the report link above them on every screen. */
export function ReportHome() {
  const activity = recentPayments()
  if (useLook() === 'sound') {
    return (
      <SoundAppScreen title="Accounts" tab="accounts">
        <div className="flex flex-col gap-2.5">
          <SoundCard className="py-2">
            <div className="pt-1 text-[12px] font-bold tracking-wide uppercase" style={{ color: SOUND.muted }}>
              Recent activity
            </div>
            <ul>
              {activity.map((e) => (
                <Row key={e.id} e={e} />
              ))}
            </ul>
          </SoundCard>
          <Hint />
        </div>
      </SoundAppScreen>
    )
  }
  return (
    <div className="flex min-h-full flex-col bg-white">
      <AppBar title="Accounts" />
      <div className="flex flex-col gap-3 px-4 pb-5">
        <div className="rounded-2xl px-3.5 py-2 ring-1 ring-line">
          <div className="pt-1 text-[12px] font-semibold tracking-wide text-ink-3 uppercase">Recent activity</div>
          <ul>
            {activity.map((e) => (
              <Row key={e.id} e={e} />
            ))}
          </ul>
        </div>
        <Hint />
      </div>
    </div>
  )
}
