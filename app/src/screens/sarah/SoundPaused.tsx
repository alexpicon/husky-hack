import { Hourglass } from 'lucide-react'
import { motion } from 'motion/react'
import { Phone } from '../../ui/devices'
import { clock, money } from '../../ui/format'
import { SOUND, SoundAppScreen, SoundCard, SoundRow } from '../../ui/soundApp'
import { sarah } from './facts'
import { CardIcon } from './soundIcon'

const muted = { color: SOUND.muted }

/** The pause on Sound's "Pay Anyone" screen. No way around it, and nothing to learn from it. */
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
            <SoundCard className="py-4">
              <div className="flex items-start gap-3">
                <CardIcon icon={Hourglass} />
                <div className="min-w-0">
                  <div className="text-[17px] leading-tight font-bold">
                    This payment is being reviewed.
                  </div>
                  <p className="mt-1 text-[15px] leading-snug" style={muted}>
                    We'll let you know when it's done.
                  </p>
                </div>
              </div>
            </SoundCard>
          </motion.div>

          <SoundCard className="py-1.5">
            <SoundRow
              label="Payment"
              value={<span className="num text-[17px] font-semibold">{money(paused.amount)}</span>}
            />
            <SoundRow
              label="Status"
              value={
                <span className="rounded-full bg-[#fff4e5] px-2.5 py-1 text-[13px] font-semibold text-[#a15c07]">
                  Pending review
                </span>
              }
            />
          </SoundCard>
        </div>
      </SoundAppScreen>
    </Phone>
  )
}
