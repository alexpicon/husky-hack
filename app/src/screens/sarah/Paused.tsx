import { Hourglass } from 'lucide-react'
import { motion } from 'motion/react'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { useLook } from '../../ui/look'
import { Badge } from '../../ui/primitives'
import { sarah } from './facts'
import { SoundBar } from './SoundChrome'
import { SoundPaused } from './SoundPaused'

/** What anyone signed in as Sarah sees the moment Send is tapped. No way around it. */
export function Paused() {
  const look = useLook()
  return (
    <div className="flex flex-col items-center gap-3">
      <Badge tone="danger">Still the scammer's screen</Badge>
      {look === 'sound' ? <SoundPaused /> : <ConceptPaused />}
    </div>
  )
}

function ConceptPaused() {
  const { paused } = sarah
  return (
    <Phone time={clock(paused.at)} caption="There is no button to get around the pause">
      <div className="flex min-h-full flex-col bg-white">
        <SoundBar channel={paused.channel} />

        <div className="px-5 pt-8 pb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="grid size-14 place-items-center rounded-2xl bg-warn-soft text-warn ring-1 ring-amber-200"
          >
            <Hourglass size={26} aria-hidden />
          </motion.div>
          <h2 className="mt-5 font-display text-[29px] leading-[1.08] tracking-tight">
            This payment is being reviewed.
          </h2>
          <p className="mt-2 text-[17px] leading-relaxed text-ink-2">
            We'll let you know when it's done.
          </p>

          <dl className="mt-6 divide-y divide-line rounded-2xl ring-1 ring-line">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-[15px] text-ink-2">Payment</dt>
              <dd className="num text-[18px] font-semibold">{money(paused.amount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-[15px] text-ink-2">Status</dt>
              <dd className="rounded-full bg-warn-soft px-2.5 py-1 text-[13px] font-semibold text-warn ring-1 ring-amber-200">
                Pending review
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Phone>
  )
}
