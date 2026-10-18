import type { ReactNode } from 'react'
import { ArrowUpRight, UserPlus } from 'lucide-react'
import { useStory } from '../../story/engine'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { Source } from '../../ui/primitives'
import { sarah } from './facts'
import { ScreenTitle, SoundBar } from './SoundChrome'
import { SoundSendMoney } from './SoundSendMoney'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] text-ink-3">{label}</span>
      <span className="text-[15px] font-semibold text-ink">{children}</span>
    </div>
  )
}

/** The scammer, signed in as Sarah, on Sound's P2P send screen. */
export function SendMoney() {
  const look = useLook()
  return (
    <div className="flex flex-col items-center gap-3">
      {look === 'sound' ? <SoundSendMoney /> : <ConceptSendMoney />}
    </div>
  )
}

function ConceptSendMoney() {
  const { next } = useStory()
  const { paused, recipientAdded } = sarah
  return (
    <Phone time={clock(paused.at)}>
      <div className="flex min-h-full flex-col bg-white">
        <SoundBar channel={paused.channel} />
        <ScreenTitle>Send money</ScreenTitle>

        <div className="px-5 pt-5">
          <div className="text-[13px] font-semibold text-ink-3">To</div>
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-line/80">
            <span className="grid size-11 place-items-center rounded-full bg-white text-ink-2 ring-1 ring-line">
              <UserPlus size={20} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold">New recipient</div>
              <div className="font-mono text-[12px] text-ink-3">{paused.recipientId}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-ink-3">Added</div>
              <div className="num font-mono text-[13px] font-semibold">{clock(recipientAdded.at)}</div>
            </div>
          </div>
          <div className="mt-1 text-right">
            <Source ids={recipientAdded.id} />
          </div>
        </div>

        <div className="px-5 pt-4 text-center">
          <div className="text-[13px] font-semibold text-ink-3">Amount</div>
          <div className="num mt-1 text-[46px] leading-none font-semibold tracking-tight">
            {money(paused.amount)}
          </div>
          <div className="mt-2">
            <Source ids={paused.id} />
          </div>
        </div>

        <div className="mx-5 mt-4 divide-y divide-line border-y border-line">
          <Row label="Send with">{paused.rail}</Row>
          <Row label="Payment">
            <span className="font-mono text-[13px]">{paused.paymentId}</span>
          </Row>
        </div>
        <p className="px-5 pt-3 text-[13px] text-ink-3">
          {paused.rail} payments usually can't be pulled back once they're sent.
        </p>

        <div className="mt-auto px-5 pt-5 pb-6">
          <button
            type="button"
            onClick={next}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[17px] font-semibold text-white shadow-float transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Send {money(paused.amount)}
            <ArrowUpRight size={18} aria-hidden />
          </button>
        </div>
      </div>
    </Phone>
  )
}
