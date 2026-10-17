import { Hand } from 'lucide-react'
import { motion } from 'motion/react'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { Source } from '../../ui/primitives'
import { SOUND, SoundAppScreen, SoundCard } from '../../ui/soundApp'
import { changesTonight, sarah } from './facts'
import { CardIcon } from './soundIcon'

const muted = { color: SOUND.muted }

/** The pause on Sound's "Pay Anyone" screen. No way around it. */
export function SoundPaused() {
  const { paused } = sarah
  return (
    <Phone
      time={clock(paused.at)}
      statusBar="navy"
      caption="There is no button to get around the pause"
    >
      <SoundAppScreen title="Pay Anyone" tab="move">
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <SoundCard className="py-3.5">
              <div className="flex items-start gap-3">
                <CardIcon icon={Hand} />
                <div className="min-w-0">
                  <div className="text-[17px] leading-tight font-bold">Payment paused</div>
                  <p className="mt-0.5 text-[15px] leading-snug" style={muted}>
                    We've paused this payment to keep your account safe.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/[0.07] pt-2.5">
                <div>
                  <div className="num text-[19px] leading-tight font-semibold">
                    {money(paused.amount)}
                  </div>
                  <div className="text-[13px]" style={muted}>
                    {paused.rail} to a new recipient <Source ids={paused.id} />
                  </div>
                </div>
                <span className="rounded-full bg-[#fdecec] px-2.5 py-1 text-[13px] font-semibold text-[#b42318]">
                  Not sent
                </span>
              </div>
            </SoundCard>
          </motion.div>

          <SoundCard className="py-3">
            <p className="text-[15px] leading-snug font-bold">
              Here's what changed on your account tonight:
            </p>
            <ul className="mt-1">
              {changesTonight.map(({ label, event }, i) => (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center justify-between gap-3 border-b border-black/[0.07] py-1.5 last:border-0"
                >
                  <span className="text-[15px] font-medium">{label}</span>
                  <span className="flex flex-col items-end leading-tight">
                    <span className="num text-[14px]" style={muted}>
                      {clock(event.at)}
                    </span>
                    <Source ids={event.id} />
                  </span>
                </motion.li>
              ))}
            </ul>
          </SoundCard>

          <p className="px-1 text-[14px] leading-snug" style={muted}>
            If this was you, we'll confirm it with you using contact details you've had with us
            for a while, or you can call the number on your card.
          </p>
        </div>
      </SoundAppScreen>
    </Phone>
  )
}
