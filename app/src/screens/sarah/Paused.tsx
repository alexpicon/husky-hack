import { Hand } from 'lucide-react'
import { motion } from 'motion/react'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { Badge, Source } from '../../ui/primitives'
import { changesTonight, sarah } from './facts'
import { SoundBar } from './SoundChrome'

/** What anyone signed in as Sarah sees the moment Send is tapped. No way around it. */
export function Paused() {
  const { paused } = sarah
  return (
    <div className="flex flex-col items-center gap-3">
      <Badge tone="danger">Still the scammer's screen</Badge>
      <Phone time={clock(paused.at)} caption="There is no button to get around the pause">
        <div className="flex min-h-full flex-col bg-white">
          <SoundBar channel={paused.channel} />

          <div className="px-5 pt-5 pb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft py-1 pr-3 pl-1.5 text-[13px] font-semibold text-warn ring-1 ring-amber-200"
            >
              <span className="grid size-5 place-items-center rounded-full bg-white">
                <Hand size={12} aria-hidden />
              </span>
              Payment paused
            </motion.div>
            <h2 className="mt-3 font-display text-[29px] leading-[1.08] tracking-tight">
              We've paused this payment to keep your account safe.
            </h2>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-warn-soft px-4 py-2.5 ring-1 ring-amber-200/80">
              <div>
                <div className="num text-[18px] font-semibold">{money(paused.amount)}</div>
                <div className="text-[13px] text-ink-2">
                  {paused.rail} to a new recipient <Source ids={paused.id} />
                </div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-warn ring-1 ring-amber-200">
                Not sent
              </span>
            </div>

            <p className="mt-5 text-[16px] font-semibold">Here's what changed on your account tonight:</p>
            <ul className="mt-2 divide-y divide-line rounded-2xl ring-1 ring-line">
              {changesTonight.map(({ label, event }, i) => (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <span className="flex w-[64px] shrink-0 flex-col leading-tight">
                    <span className="num font-mono text-[13px] text-ink-2">{clock(event.at)}</span>
                    <Source ids={event.id} />
                  </span>
                  <span className="text-[16px] font-medium">{label}</span>
                </motion.li>
              ))}
            </ul>

            <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
              If this was you, we'll confirm it with you using contact details you've had with us
              for a while, or you can call the number on your card.
            </p>
          </div>
        </div>
      </Phone>
    </div>
  )
}
